class AppConstants {
  static const String appName = 'STALLA';
  static const String apiBaseUrl = 'http://192.168.100.84:4000/api';
  // Valeurs possibles: 'orange' | 'earth'
  static const String colorPalette = 'orange';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';

  // Routes
  static const String loginRoute = '/login';
  static const String homeRoute = '/home';
  static const String standRoute = '/stand';
  static const String debtsRoute = '/debts';
  static const String paymentsRoute = '/payments';
  static const String profileRoute = '/profile';
}
