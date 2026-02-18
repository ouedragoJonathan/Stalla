import 'package:dio/dio.dart';
import '../models/api_response.dart';
import '../services/api_client.dart';

class StandZoneOverview {
  final String zone;
  final int standardAvailable;
  final int standardPriceMin;
  final int standardPriceMax;
  final int premiumAvailable;
  final int premiumPriceMin;
  final int premiumPriceMax;

  StandZoneOverview({
    required this.zone,
    required this.standardAvailable,
    required this.standardPriceMin,
    required this.standardPriceMax,
    required this.premiumAvailable,
    required this.premiumPriceMin,
    required this.premiumPriceMax,
  });

  factory StandZoneOverview.fromJson(Map<String, dynamic> json) {
    final standard = json['standard'] as Map<String, dynamic>? ?? {};
    final premium = json['premium'] as Map<String, dynamic>? ?? {};
    return StandZoneOverview(
      zone: json['zone'] as String,
      standardAvailable: (standard['available'] as num?)?.toInt() ?? 0,
      standardPriceMin: (standard['price_min'] as num?)?.toInt() ?? 10000,
      standardPriceMax: (standard['price_max'] as num?)?.toInt() ?? 30000,
      premiumAvailable: (premium['available'] as num?)?.toInt() ?? 0,
      premiumPriceMin: (premium['price_min'] as num?)?.toInt() ?? 35000,
      premiumPriceMax: (premium['price_max'] as num?)?.toInt() ?? 50000,
    );
  }
}

class StandRepository {
  final ApiClient _apiClient = ApiClient();

  Future<ApiResponse<List<StandZoneOverview>>> getPublicStandsOverview() async {
    try {
      final response = await _apiClient.dio.get('/public/stands/overview');
      if (response.statusCode == 200) {
        final data = response.data['data'] as List;
        final zones = data
            .map((json) => StandZoneOverview.fromJson(json as Map<String, dynamic>))
            .toList();
        return ApiResponse<List<StandZoneOverview>>(
          success: true,
          data: zones,
        );
      }
      return ApiResponse<List<StandZoneOverview>>(
        success: false,
        message: response.data['message'] ?? 'Erreur inconnue',
      );
    } on DioException catch (e) {
      return ApiResponse<List<StandZoneOverview>>(
        success: false,
        message: e.response?.data['message'] ?? e.message ?? 'Erreur réseau',
      );
    } catch (e) {
      return ApiResponse<List<StandZoneOverview>>(
        success: false,
        message: e.toString(),
      );
    }
  }
}
