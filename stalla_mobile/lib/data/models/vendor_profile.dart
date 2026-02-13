import 'package:equatable/equatable.dart';
import 'user.dart';
import 'stand.dart';

class VendorProfile extends Equatable {
  final User user;
  final Stand? stand;
  final String? businessType;
  final String? supportPhone;

  const VendorProfile({
    required this.user,
    this.stand,
    this.businessType,
    this.supportPhone,
  });

  factory VendorProfile.fromJson(Map<String, dynamic> json) {
    return VendorProfile(
      user: User.fromJson(json['user']),
      stand: json['stand'] != null ? Stand.fromJson(json['stand']) : null,
      businessType: json['business_type'],
      supportPhone: json['support_phone'],
    );
  }

  @override
  List<Object?> get props => [user, stand, businessType, supportPhone];
}
