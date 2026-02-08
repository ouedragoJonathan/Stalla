import 'package:dio/dio.dart';
import '../models/api_response.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../services/storage_service.dart';

class AuthRepository {
  final _apiClient = ApiClient().dio;
  final _storage = StorageService();

  Future<ApiResponse<Map<String, dynamic>>> login({
  required String email,
  required String password,
  }) async {
  try {
    // Détecter si c'est un email ou un téléphone
    final isEmail = email.contains('@');
    
    final response = await _apiClient.post(
      '/auth/vendor/login',
      data: isEmail 
        ? {
            'email': email,
            'password': password,
          }
        : {
            'phone': email,  // C'est en fait un numéro
            'password': password,
          },
    );

    final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
      response.data,
      (data) => data as Map<String, dynamic>,
    );

    if (apiResponse.success && apiResponse.data != null) {
      final token = apiResponse.data!['token'];
      final userData = apiResponse.data!['user'];
      
      await _storage.saveToken(token);
      await _storage.saveUserData(userData);
    }

    return apiResponse;
  } on DioException catch (e) {
    return ApiResponse(
      success: false,
      message: e.response?.data['message'] ?? 'Erreur de connexion',
      errors: e.response?.data['errors'],
    );
  }
}

  Future<void> logout() async {
    await _storage.clearAll();
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.getToken();
    return token != null;
  }

  User? getCurrentUser() {
    final userData = _storage.getUserData();
    if (userData != null) {
      return User.fromJson(userData);
    }
    return null;
  }
}