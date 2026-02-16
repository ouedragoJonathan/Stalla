import 'package:flutter/foundation.dart';
import '../../data/models/vendor_profile.dart';
import '../../data/models/debt.dart';
import '../../data/repositories/vendor_repository.dart';

class VendorProvider extends ChangeNotifier {
  final _vendorRepository = VendorRepository();

  VendorProfile? _profile;
  Debt? _debt;
  bool _isLoading = false;
  String? _errorMessage;

  VendorProfile? get profile => _profile;
  Debt? get debt => _debt;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchProfile() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final response = await _vendorRepository.getProfile();

    if (response.success && response.data != null) {
      _profile = response.data;
    } else {
      _errorMessage = response.message;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchDebts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final response = await _vendorRepository.getDebts();

    if (response.success && response.data != null) {
      _debt = response.data;
    } else {
      _errorMessage = response.message;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> resetPassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final response = await _vendorRepository.resetPassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );

    _isLoading = false;
    if (!response.success) {
      _errorMessage = response.message;
      notifyListeners();
      return false;
    }

    notifyListeners();
    return true;
  }

  void clearData() {
    _profile = null;
    _debt = null;
    _errorMessage = null;
    notifyListeners();
  }
}
