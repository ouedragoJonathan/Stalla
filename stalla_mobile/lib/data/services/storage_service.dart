import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final _secureStorage = const FlutterSecureStorage();
  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Token methods (secure)
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: 'auth_token', value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: 'auth_token');
  }

  Future<void> deleteToken() async {
    await _secureStorage.delete(key: 'auth_token');
  }

  // User data methods
  Future<void> saveUserData(Map<String, dynamic> userData) async {
    await _prefs?.setString('user_data', jsonEncode(userData));
  }

  Map<String, dynamic>? getUserData() {
    final data = _prefs?.getString('user_data');
    if (data != null) {
      return jsonDecode(data);
    }
    return null;
  }

  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs?.clear();
  }
}