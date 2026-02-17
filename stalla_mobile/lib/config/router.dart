import 'package:go_router/go_router.dart';
import '../core/constants/app_constants.dart';
import '../presentation/screens/landing_page.dart';
import '../presentation/screens/login_screen.dart';
import '../presentation/screens/register_screen.dart';
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
    // 1. On définit la Landing Page comme emplacement de départ
    initialLocation: '/landing',

    redirect: (context, state) async {
      final isLoggedIn = await _authRepository.isLoggedIn();

      // On vérifie sur quelle route se trouve l'utilisateur
      final isLandingRoute = state.matchedLocation == '/landing';
      final isLoginRoute = state.matchedLocation == AppConstants.loginRoute;
      final isRegisterRoute =
          state.matchedLocation == AppConstants.registerRoute;

      // SI l'utilisateur n'est PAS connecté :
      // On l'autorise à rester sur Landing ou Login, sinon on le renvoie sur Landing
      if (!isLoggedIn) {
        if (isLandingRoute || isLoginRoute || isRegisterRoute) return null;
        return '/landing';
      }

      // SI l'utilisateur EST connecté :
      // S'il essaie d'aller sur Landing ou Login, on le redirige vers la Home
      if (isLoggedIn && (isLandingRoute || isLoginRoute || isRegisterRoute)) {
        return AppConstants.homeRoute;
      }

      // Dans tous les autres cas, on ne redirige pas
      return null;
    },

    routes: [
      // Route pour la Landing Page
      GoRoute(
        path: '/landing',
        builder: (context, state) => const LandingPage(),
      ),

      // Route pour le Login
      GoRoute(
        path: AppConstants.loginRoute,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppConstants.registerRoute,
        builder: (context, state) => const RegisterScreen(),
      ),

      // Routes protégées (nécessitent d'être connecté)
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
