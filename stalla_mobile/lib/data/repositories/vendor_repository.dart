import 'package:dio/dio.dart';
import '../models/api_response.dart';
import '../models/vendor_profile.dart';
import '../models/debt.dart';
import '../services/api_client.dart';

class VendorRepository {
  final _apiClient = ApiClient().dio;

  Future<ApiResponse<VendorProfile>> getProfile() async {
    try {
      final response = await _apiClient.get('/vendors/me');

      return ApiResponse<VendorProfile>.fromJson(
        response.data,
        (data) => VendorProfile.fromJson(data),
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] ?? 'Erreur lors de la récupération du profil',
      );
    }
  }

  Future<ApiResponse<Debt>> getDebts() async {
    try {
      final response = await _apiClient.get('/vendors/me/debts');

      return ApiResponse<Debt>.fromJson(
        response.data,
        (data) => Debt.fromJson(data),
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] ?? 'Erreur lors de la récupération des dettes',
      );
    }
  }
}