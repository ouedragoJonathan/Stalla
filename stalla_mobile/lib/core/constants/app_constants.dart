class AppConstants {
  static const String appName = 'STALLA';
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://stalla-production.up.railway.app/api',
  );
  static const String supportPhone = '+22900000000';
  // Valeurs possibles: 'orange' | 'earth'
  static const String colorPalette = 'orange';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';

  // Routes
  static const String loginRoute = '/login';
  static const String registerRoute = '/register';
  static const String homeRoute = '/home';
  static const String standRoute = '/stand';
  static const String debtsRoute = '/debts';
  static const String paymentsRoute = '/payments';
  static const String profileRoute = '/profile';

  // API Endpoints
  static const String authLoginEndpoint = '/auth/login';
  static const String authVendorApplicationEndpoint =
      '/auth/vendor-application';
  static const String vendorProfileEndpoint = '/vendor/profile';
  static const String vendorMyStallEndpoint = '/vendor/my-stall';
  static const String vendorBalanceEndpoint = '/vendor/balance';
  static const String vendorPaymentsEndpoint = '/vendor/payments';
  static const String vendorResetPasswordEndpoint = '/vendor/reset-password';
}
