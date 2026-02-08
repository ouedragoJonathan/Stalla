import 'package:go_router/go_router.dart';
import '../core/constants/app_constants.dart';
import '../presentation/screens/login_screen.dart';
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
    initialLocation: AppConstants.loginRoute,
    redirect: (context, state) async {
      final isLoggedIn = await _authRepository.isLoggedIn();
      final isLoginRoute = state.matchedLocation == AppConstants.loginRoute;

      if (!isLoggedIn && !isLoginRoute) {
        return AppConstants.loginRoute;
      }

      if (isLoggedIn && isLoginRoute) {
        return AppConstants.homeRoute;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppConstants.loginRoute,
        builder: (context, state) => const LoginScreen(),
      ),
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