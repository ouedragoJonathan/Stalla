import 'package:flutter/foundation.dart';
import '../../data/models/user.dart';
import '../../data/repositories/auth_repository.dart';

enum AuthStatus { initial, authenticated, unauthenticated, loading }

class AuthProvider extends ChangeNotifier {
  final _authRepository = AuthRepository();

  AuthStatus _status = AuthStatus.initial;
  User? _user;
  String? _errorMessage;

  AuthStatus get status => _status;
  User? get user => _user;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> checkAuthStatus() async {
    final isLoggedIn = await _authRepository.isLoggedIn();
    if (isLoggedIn) {
      _user = _authRepository.getCurrentUser();
      if (_user?.role == 'VENDOR') {
        _status = AuthStatus.authenticated;
      } else {
        await _authRepository.logout();
        _user = null;
        _status = AuthStatus.unauthenticated;
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String identifier, String password) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    final response = await _authRepository.login(
      identifier: identifier,
      password: password,
    );

    if (response.success && response.data != null) {
      _user = User.fromJson(response.data!['user'] as Map<String, dynamic>);

      if (_user?.role != 'VENDOR') {
        await _authRepository.logout();
        _user = null;
        _status = AuthStatus.unauthenticated;
        _errorMessage = 'Cette application est réservée aux vendeurs.';
        notifyListeners();
        return false;
      }

      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } else {
      _errorMessage = response.message ?? 'Erreur de connexion';
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  Future<bool> submitVendorApplication({
    required String fullName,
    required String businessType,
    required String phone,
    String? email,
    required String desiredZone,
    required double budgetMin,
    required double budgetMax,
  }) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    final response = await _authRepository.submitVendorApplication(
      fullName: fullName,
      businessType: businessType,
      phone: phone,
      email: email,
      desiredZone: desiredZone,
      budgetMin: budgetMin,
      budgetMax: budgetMax,
    );

    if (response.success) {
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return true;
    }

    _errorMessage = response.message ?? 'Erreur lors de la demande';
    _status = AuthStatus.unauthenticated;
    notifyListeners();
    return false;
  }
}
