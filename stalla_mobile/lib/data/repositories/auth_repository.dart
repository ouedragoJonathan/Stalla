import 'package:dio/dio.dart';
import '../../core/constants/app_constants.dart';
import '../models/api_response.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../services/storage_service.dart';

class AuthRepository {
  final _apiClient = ApiClient().dio;
  final _storage = StorageService();

  Future<ApiResponse<Map<String, dynamic>>> login({
    required String identifier,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        AppConstants.authLoginEndpoint,
        data: {
          'identifier': identifier,
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

  Future<ApiResponse<Map<String, dynamic>>> submitVendorApplication({
    required String fullName,
    required String phone,
    String? email,
    required String desiredZone,
    required double budgetMin,
    required double budgetMax,
  }) async {
    try {
      final response = await _apiClient.post(
        AppConstants.authVendorApplicationEndpoint,
        data: {
          'full_name': fullName,
          'phone': phone,
          'email': email?.trim().isEmpty == true ? null : email,
          'desired_zone': desiredZone,
          'budget_min': budgetMin,
          'budget_max': budgetMax,
        },
      );

      return ApiResponse<Map<String, dynamic>>.fromJson(
        response.data,
        (data) => data as Map<String, dynamic>,
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] ??
            'Erreur lors de l\'envoi de la demande',
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
