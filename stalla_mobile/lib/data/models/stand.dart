import 'package:equatable/equatable.dart';

class Stand extends Equatable {
  final int id;
  final String code;
  final String zone;
  final double surface;
  final int monthlyRent;
  final String? status;

  const Stand({
    required this.id,
    required this.code,
    required this.zone,
    required this.surface,
    required this.monthlyRent,
    this.status,
  });

  factory Stand.fromJson(Map<String, dynamic> json) {
    return Stand(
      id: json['id'],
      code: json['code'],
      zone: json['zone'],
      surface: (json['surface'] as num).toDouble(),
      monthlyRent: json['monthlyRent'],
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'zone': zone,
      'surface': surface,
      'monthlyRent': monthlyRent,
      'status': status,
    };
  }

  @override
  List<Object?> get props => [id, code, zone, surface, monthlyRent, status];
}