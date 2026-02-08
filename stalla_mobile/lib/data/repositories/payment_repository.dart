import 'package:dio/dio.dart';
import '../models/api_response.dart';
import '../models/payment.dart';
import '../services/api_client.dart';

class PaymentRepository {
  final _apiClient = ApiClient().dio;

  Future<ApiResponse<List<Payment>>> getPayments() async {
    try {
      final response = await _apiClient.get('/payments');

      return ApiResponse<List<Payment>>.fromJson(
        response.data,
        (data) => (data as List).map((e) => Payment.fromJson(e)).toList(),
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] ?? 'Erreur lors de la récupération des paiements',
      );
    }
  }

  Future<String?> downloadReceipt(String receiptPath) async {
    try {
      // Pour télécharger le PDF, on retourne l'URL complète
      return '${_apiClient.options.baseUrl}$receiptPath';
    } catch (e) {
      return null;
    }
  }
}