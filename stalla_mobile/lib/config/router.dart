import 'package:go_router/go_router.dart';
import '../core/constants/app_constants.dart';
import '../presentation/screens/landing_page.dart';
import '../presentation/screens/login_screen.dart';
import '../presentation/screens/register_screen.dart';
import '../presentation/screens/stand_list_screen.dart';
import '../presentation/screens/home_screen.dart';
import '../presentation/screens/stand_screen.dart';
import '../presentation/screens/debts_screen.dart';
import '../presentation/screens/payments_screen.dart';
import '../presentation/screens/profile_screen.dart';
import '../presentation/widgets/main_layout.dart';
import '../data/repositories/auth_repository.dart';

class AppRouter {
  final AuthRepository _authRepository = AuthRepository();

  late final GoRouter router = GoRouter(
    initialLocation: '/landing',

    redirect: (context, state) async {
      final isLoggedIn = await _authRepository.isLoggedIn();

      final isLandingRoute = state.matchedLocation == '/landing';
      final isLoginRoute = state.matchedLocation == AppConstants.loginRoute;
      final isRegisterRoute =
          state.matchedLocation == AppConstants.registerRoute;
      final isStandsRoute = state.matchedLocation == '/stands';

      // Public routes: accessible without login
      if (!isLoggedIn) {
        if (isLandingRoute ||
            isLoginRoute ||
            isRegisterRoute ||
            isStandsRoute) {
          return null;
        }
        return '/landing';
      }

      // If logged in, redirect away from public auth screens
      if (isLoggedIn && (isLandingRoute || isLoginRoute || isRegisterRoute)) {
        return AppConstants.homeRoute;
      }

      return null;
    },

    routes: [
      // Landing Page
      GoRoute(
        path: '/landing',
        builder: (context, state) => const LandingPage(),
      ),

      // Public stand listing (no auth required)
      GoRoute(
        path: '/stands',
        builder: (context, state) => const StandListScreen(),
      ),

      // Login
      GoRoute(
        path: AppConstants.loginRoute,
        builder: (context, state) => const LoginScreen(),
      ),

      // Register / Application form (can receive zone + category as extras)
      GoRoute(
        path: AppConstants.registerRoute,
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return RegisterScreen(
            initialZone: extra?['zone'] as String?,
            initialCategory: extra?['category'] as String?,
          );
        },
      ),

      // Protected routes
      ShellRoute(
        builder: (context, state, child) {
          return MainLayout(
            currentPath: state.matchedLocation,
            child: child,
          );
        },
        routes: [
          GoRoute(
            path: AppConstants.homeRoute,
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: AppConstants.standRoute,
            builder: (context, state) => const StandScreen(),
          ),
          GoRoute(
            path: AppConstants.debtsRoute,
            builder: (context, state) => const DebtsScreen(),
          ),
          GoRoute(
            path: AppConstants.paymentsRoute,
            builder: (context, state) => const PaymentsScreen(),
          ),
          GoRoute(
            path: AppConstants.profileRoute,
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
}
