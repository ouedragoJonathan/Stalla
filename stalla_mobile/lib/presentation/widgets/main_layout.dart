import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_constants.dart';

class MainLayout extends StatelessWidget {
  final Widget child;
  final String currentPath;

  const MainLayout({
    super.key,
    required this.child,
    required this.currentPath,
  });

  int get _currentIndex {
    switch (currentPath) {
      case '/home':
        return 0;
      case '/stand':
        return 1;
      case '/debts':
        return 2;
      case '/payments':
        return 3;
      case '/profile':
        return 4;
      default:
        return 0;
    }
  }

  void _onItemTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go(AppConstants.homeRoute);
        break;
      case 1:
        context.go(AppConstants.standRoute);
        break;
      case 2:
        context.go(AppConstants.debtsRoute);
        break;
      case 3:
        context.go(AppConstants.paymentsRoute);
        break;
      case 4:
        context.go(AppConstants.profileRoute);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(
              color: AppColors.lightOrange,
              width: 1,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => _onItemTapped(context, index),
          type: BottomNavigationBarType.fixed,
          backgroundColor: AppColors.white,
          selectedItemColor: AppColors.orangePantone,
          unselectedItemColor: AppColors.sandyBrown,
          selectedFontSize: 10,
          unselectedFontSize: 10,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Accueil',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.store_outlined),
              activeIcon: Icon(Icons.store),
              label: 'Stand',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.warning_amber_outlined),
              activeIcon: Icon(Icons.warning_amber),
              label: 'Dettes',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              activeIcon: Icon(Icons.receipt_long),
              label: 'Historique',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profil',
            ),
          ],
        ),
      ),
    );
  }
}