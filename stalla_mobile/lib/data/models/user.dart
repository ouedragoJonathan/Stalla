import 'package:equatable/equatable.dart';

class User extends Equatable {
  final int id;
  final String name;
  final String? email; // Passage en optionnel avec le "?"
  final String phone;  // Nouveau champ obligatoire
  final String role;

  const User({
    required this.id,
    required this.name,
    this.email,
    required this.phone,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'] ?? 'Utilisateur',
      // On utilise ?? null pour l'email s'il n'existe pas
      email: json['email'], 
      // On s'assure que phone ne soit jamais null pour éviter le crash
      phone: json['phone'] ?? '', 
      role: json['role'] ?? 'VENDOR',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
    };
  }

  @override
  List<Object?> get props => [id, name, email, phone, role];
}