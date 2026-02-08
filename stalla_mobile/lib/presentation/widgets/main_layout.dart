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
    if (currentPath.startsWith('/home')) return 0;
    if (currentPath.startsWith('/stand')) return 1;
    if (currentPath.startsWith('/debts')) return 2;
    if (currentPath.startsWith('/payments')) return 3;
    if (currentPath.startsWith('/profile')) return 4;
    return 0;
  }

  void _onItemTapped(BuildContext context, int index) {
    final routes = [
      AppConstants.homeRoute,
      AppConstants.standRoute,
      AppConstants.debtsRoute,
      AppConstants.paymentsRoute,
      AppConstants.profileRoute,
    ];
    if (_currentIndex != index) {
      context.go(routes[index]);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true, // Permet au contenu de passer sous la barre flottante
      body: child,
      bottomNavigationBar: _buildModernNavBar(context),
    );
  }

  Widget _buildModernNavBar(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 20), // Marges pour l'effet flottant
      height: 70,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            // ignore: deprecated_member_use
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(0, Icons.home_rounded, 'Accueil'),
          _buildNavItem(1, Icons.store_rounded, 'Stand'),
          _buildNavItem(2, Icons.warning_amber_rounded, 'Dettes'),
          _buildNavItem(3, Icons.receipt_long_rounded, 'Ventes'),
          _buildNavItem(4, Icons.person_rounded, 'Profil'),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _currentIndex == index;
    // ignore: deprecated_member_use
    final color = isSelected ? AppColors.orangePantone : Colors.grey.withOpacity(0.6);

    return GestureDetector(
      onTap: () => _onItemTapped(null!, index), // Note: Passer le context via un callback si nécessaire ou utiliser Builder
      child: Builder(
        builder: (context) => InkWell(
          onTap: () => _onItemTapped(context, index),
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              // ignore: deprecated_member_use
              color: isSelected ? AppColors.orangePantone.withOpacity(0.1) : Colors.transparent,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  icon,
                  color: color,
                  size: 26,
                ),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: TextStyle(
                    color: color,
                    fontSize: 10,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}