import 'package:equatable/equatable.dart';

class Stand extends Equatable {
  final int? id;
  final String code;
  final String zone;
  final double? surface;
  final int monthlyRent;
  final String? status;
  final String? endDate;
  final int? daysRemaining;

  const Stand({
    this.id,
    required this.code,
    required this.zone,
    this.surface,
    required this.monthlyRent,
    this.status,
    this.endDate,
    this.daysRemaining,
  });

  factory Stand.fromJson(Map<String, dynamic> json) {
    final rawRent = json['monthly_price'] ?? json['monthlyRent'] ?? 0;

    return Stand(
      id: json['id'] as int?,
      code: (json['code'] ?? json['stall_code'] ?? '') as String,
      zone: (json['zone'] ?? '') as String,
      surface: json['surface'] != null ? (json['surface'] as num).toDouble() : null,
      monthlyRent: (rawRent as num).toInt(),
      status: json['status'] as String?,
      endDate: json['end_date'] as String?,
      daysRemaining: json['days_remaining'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'zone': zone,
      'surface': surface,
      'monthly_price': monthlyRent,
      'status': status,
      'end_date': endDate,
      'days_remaining': daysRemaining,
    };
  }

  @override
  List<Object?> get props => [id, code, zone, surface, monthlyRent, status, endDate, daysRemaining];
}
