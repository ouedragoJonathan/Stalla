import 'package:dio/dio.dart';
import '../models/api_response.dart';
import '../models/payment.dart';
import '../services/api_client.dart';

class PaymentRepository {
  final _apiClient = ApiClient().dio;

  Future<ApiResponse<List<Payment>>> getPayments() async {
    try {
      final response = await _apiClient.get('/vendor/payments');

      return ApiResponse<List<Payment>>.fromJson(
        response.data,
        (data) => (data as List).map((e) => Payment.fromJson(e as Map<String, dynamic>)).toList(),
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] ?? 'Erreur lors de la récupération des paiements',
      );
    }
  }

  Future<String?> downloadReceipt(String receiptPath) async {
    return null;
  }
}
