import 'package:equatable/equatable.dart';
import 'user.dart';
import 'stand.dart';

class VendorProfile extends Equatable {
  final User user;
  final Stand? stand;

  const VendorProfile({
    required this.user,
    this.stand,
  });

  factory VendorProfile.fromJson(Map<String, dynamic> json) {
    return VendorProfile(
      user: User.fromJson(json['user']),
      stand: json['stand'] != null ? Stand.fromJson(json['stand']) : null,
    );
  }

  @override
  List<Object?> get props => [user, stand];
}