import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'config/router.dart';
import 'core/theme/app_theme.dart';
import 'data/services/storage_service.dart';
import 'data/services/api_client.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/vendor_provider.dart';
import 'presentation/providers/payment_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialisation des services
  await StorageService().init();
  ApiClient().init();
  
  // Initialisation de la locale française
  await initializeDateFormatting('fr_FR', null);
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..checkAuthStatus()),
        ChangeNotifierProvider(create: (_) => VendorProvider()),
        ChangeNotifierProvider(create: (_) => PaymentProvider()),
      ],
      child: Builder(
        builder: (context) {
          final router = AppRouter().router;
          
          return MaterialApp.router(
            title: 'STALLA',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            routerConfig: router,
          );
        },
      ),
    );
  }
}