import 'package:dio/dio.dart';
import '../models/api_response.dart';
import '../models/vendor_profile.dart';
import '../models/debt.dart';
import '../models/stand.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../services/storage_service.dart';

class VendorRepository {
  final _apiClient = ApiClient().dio;
  final _storage = StorageService();

  Future<ApiResponse<VendorProfile>> getProfile() async {
    final userData = _storage.getUserData();
    if (userData == null) {
      return ApiResponse(
        success: false,
        message: 'Session utilisateur introuvable',
      );
    }

    final user = User.fromJson(userData);

    try {
      final response = await _apiClient.get('/vendor/my-stall');
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data,
        (data) => data as Map<String, dynamic>,
      );

      if (apiResponse.success && apiResponse.data != null) {
        final stand = Stand.fromJson(apiResponse.data!);
        return ApiResponse(
          success: true,
          message: apiResponse.message,
          data: VendorProfile(user: user, stand: stand),
        );
      }

      return ApiResponse(success: true, data: VendorProfile(user: user, stand: null));
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return ApiResponse(
          success: true,
          message: e.response?.data['message'] ?? 'Aucun stand actif',
          data: VendorProfile(user: user, stand: null),
        );
      }

      return ApiResponse(
        success: false,
        message: e.response?.data['message'] ?? 'Erreur lors de la récupération du profil',
      );
    }
  }

  Future<ApiResponse<Debt>> getDebts() async {
    try {
      final response = await _apiClient.get('/vendor/balance');
      return ApiResponse<Debt>.fromJson(
        response.data,
        (data) => Debt.fromJson(data as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] ?? 'Erreur lors de la récupération de la balance',
      );
    }
  }

  Future<ApiResponse<void>> resetPassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _apiClient.post(
        '/vendor/reset-password',
        data: {
          'current_password': currentPassword,
          'new_password': newPassword,
        },
      );

      final apiResponse = ApiResponse<dynamic>.fromJson(response.data, null);
      return ApiResponse<void>(
        success: apiResponse.success,
        message: apiResponse.message,
        errors: apiResponse.errors,
      );
    } on DioException catch (e) {
      return ApiResponse<void>(
        success: false,
        message: e.response?.data['message'] ?? 'Erreur lors de la réinitialisation',
        errors: e.response?.data['errors'],
      );
    }
  }
}
