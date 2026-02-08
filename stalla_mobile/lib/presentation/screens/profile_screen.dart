import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../providers/vendor_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  // Ton mécanisme de déconnexion conservé intact
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
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Mon Profil', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: Consumer<VendorProvider>(
        builder: (context, vendorProvider, _) {
          final user = vendorProvider.profile?.user;
          final String initial = user?.name.isNotEmpty == true 
              ? user!.name[0].toUpperCase() 
              : 'U';

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                const SizedBox(height: 20),
                
                // --- HEADER AVATAR STYLISÉ ---
                Center(
                  child: Stack(
                    children: [
                      Container(
                        width: 110,
                        height: 110,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          border: Border.all(color: AppColors.orangePantone, width: 3),
                          boxShadow: [
                            BoxShadow(
                              // ignore: deprecated_member_use
                              color: AppColors.orangePantone.withOpacity(0.2),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            )
                          ],
                        ),
                        child: Center(
                          child: Text(
                            initial,
                            style: const TextStyle(
                              fontSize: 40,
                              fontWeight: FontWeight.bold,
                              color: AppColors.orangePantone,
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 5,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Colors.green, 
                            shape: BoxShape.circle
                          ),
                          child: const Icon(Icons.check, color: Colors.white, size: 16),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 15),
                Text(
                  user?.name ?? 'Utilisateur',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const Text('Vendeur Marché Certifié', style: TextStyle(color: Colors.grey)),
                
                const SizedBox(height: 35),

                // --- SECTION : INFORMATIONS PERSONNELLES ---
                _buildSectionTitle('Informations Personnelles'),
                const SizedBox(height: 12),
                _buildProfileCard([
                  _buildProfileTile(Icons.person_outline, 'Nom complet', user?.name ?? '-'),
                  _buildProfileTile(Icons.email_outlined, 'Email', user?.email ?? '-'),
                  _buildProfileTile(Icons.phone_iphone_rounded, 'Téléphone', user?.phone ?? '-'),
                ]),

                const SizedBox(height: 25),

                // --- SECTION : COMPTE & STAND ---
                _buildSectionTitle('Mon Établissement'),
                const SizedBox(height: 12),
                _buildProfileCard([
                  _buildProfileTile(
                    Icons.storefront_outlined, 
                    'Stand', 
                    vendorProvider.profile?.stand != null 
                        ? 'Stand N°${vendorProvider.profile?.stand}' 
                        : 'Aucun stand assigné'
                  ),
                  _buildProfileTile(Icons.verified_user_outlined, 'Rôle', 'Vendeur Professionnel'),
                ]),

                const SizedBox(height: 40),

                // --- BOUTON DÉCONNEXION (DESIGN MODERNE) ---
                ElevatedButton.icon(
                  onPressed: () => _handleLogout(context),
                  icon: const Icon(Icons.logout_rounded),
                  label: const Text('Se déconnecter'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.redAccent,
                    minimumSize: const Size(double.infinity, 55),
                    elevation: 0,
                    side: const BorderSide(color: Colors.redAccent, width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
                const SizedBox(height: 100), 
              ],
            ),
          );
        },
      ),
    );
  }

  // --- HELPER WIDGETS ---

  Widget _buildSectionTitle(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: TextStyle(
          fontSize: 13, 
          fontWeight: FontWeight.bold, 
          color: Colors.grey[600], 
          letterSpacing: 0.5
        ),
      ),
    );
  }

  Widget _buildProfileCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            // ignore: deprecated_member_use
            color: Colors.black.withOpacity(0.03), 
            blurRadius: 15, 
            offset: const Offset(0, 5)
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildProfileTile(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              // ignore: deprecated_member_use
              color: AppColors.orangePantone.withOpacity(0.1), 
              borderRadius: BorderRadius.circular(10)
            ),
            child: Icon(icon, color: AppColors.orangePantone, size: 20),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                Text(
                  value, 
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}