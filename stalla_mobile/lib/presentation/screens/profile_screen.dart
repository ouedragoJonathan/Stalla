import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../providers/vendor_provider.dart';
import '../widgets/custom_card.dart';
import '../widgets/info_row.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _handleLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Déconnexion'),
        content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.error,
            ),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      await context.read<AuthProvider>().logout();
      // ignore: use_build_context_synchronously
      context.read<VendorProvider>().clearData();
      
      if (context.mounted) {
        context.go(AppConstants.loginRoute);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<VendorProvider>(
          builder: (context, vendorProvider, _) {
            final user = vendorProvider.profile?.user;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Text(
                    'Profil',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Mes informations',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),

                  // Avatar
                  Center(
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: const BoxDecoration(
                        color: AppColors.lightOrange,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          user?.name.substring(0, 1).toUpperCase() ?? 'U',
                          style: Theme.of(context).textTheme.displayLarge?.copyWith(
                                color: AppColors.orangePantone,
                              ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Informations
                  CustomCard(
                    child: Column(
                      children: [
                        InfoRow(
                          label: 'Nom complet',
                          value: user?.name ?? '-',
                        ),
                        InfoRow(
                          label: 'Email',
                          value: user?.email ?? '-',
                        ),
                        InfoRow(
                          label: 'Téléphone',
                          value: user?.phone ?? '-',
                        ),
                        const InfoRow(
                          label: 'Rôle',
                          value: 'Vendeur Marché',
                        ),
                      ],
                    ),
                  ),

                  // Bouton de déconnexion
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => _handleLogout(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(
                          color: AppColors.orangePantone,
                          width: 2,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'Déconnexion',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                              color: AppColors.orangePantone,
                            ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}