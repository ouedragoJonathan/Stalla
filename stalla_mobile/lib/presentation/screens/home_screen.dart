import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../providers/vendor_provider.dart';
import '../widgets/loading_widget.dart';
import '../widgets/error_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final vendorProvider = context.read<VendorProvider>();
    await Future.wait([
      vendorProvider.fetchProfile(),
      vendorProvider.fetchDebts(),
    ]);
  }

  String _formatCurrency(int amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(amount)} F';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: SafeArea(
        child: Consumer<VendorProvider>(
          builder: (context, vendorProvider, _) {
            if (vendorProvider.isLoading && vendorProvider.profile == null) {
              return const LoadingWidget(message: 'Préparation du tableau de bord...');
            }

            if (vendorProvider.errorMessage != null && vendorProvider.profile == null) {
              return ErrorDisplay(message: vendorProvider.errorMessage!, onRetry: _loadData);
            }

            final profile = vendorProvider.profile;
            final debt = vendorProvider.debt;
            final hasDebt = debt != null && debt.totalDue > 0;

            return RefreshIndicator(
              onRefresh: _loadData,
              color: AppColors.orangePantone,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // --- HEADER ---
                    _buildHeader(profile?.user.name),
                    const SizedBox(height: 25),

                    // --- CARTE DU STAND (IDENTITY CARD) ---
                    if (profile?.stand != null)
                      _buildStandCard(profile!.stand!),

                    const SizedBox(height: 20),

                    // --- SECTION : RÉSUMÉ FINANCIER ---
                    const Text(
                      'Résumé financier',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 15),

                    // Grille de widgets
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatCard(
                            'Dette Totale',
                            debt != null ? _formatCurrency(debt.totalDue) : '0 F',
                            hasDebt ? Colors.redAccent : Colors.green,
                            Icons.account_balance_wallet_rounded,
                          ),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          child: _buildStatCard(
                            'Loyer Mensuel',
                            profile?.stand != null ? _formatCurrency(profile!.stand!.monthlyRent) : '-',
                            AppColors.orangePantone,
                            Icons.storefront_rounded,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // --- CARTE ALERTE ÉCHÉANCE ---
                    if (hasDebt)
                      _buildDeadlineCard(debt),

                    const SizedBox(height: 100), // Espace pour la barre de navigation
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildHeader(String? name) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bonjour',
              style: TextStyle(color: Colors.grey[600], fontSize: 16),
            ),
            Text(
              name ?? 'Utilisateur',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        CircleAvatar(
          radius: 25,
          // ignore: deprecated_member_use
          backgroundColor: AppColors.orangePantone.withOpacity(0.1),
          child: const Icon(Icons.person_rounded, color: AppColors.orangePantone),
        ),
      ],
    );
  }

  Widget _buildStandCard(dynamic stand) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.orangePantone, Color(0xFFFF8C52)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            // ignore: deprecated_member_use
            color: AppColors.orangePantone.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('STAND ACTUEL', 
                style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.2)),
              // ignore: deprecated_member_use
              Icon(Icons.qr_code_scanner_rounded, color: Colors.white.withOpacity(0.5)),
            ],
          ),
          const SizedBox(height: 8),
          Text(stand.code, 
            style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text('Zone: ${stand.zone}', 
            style: const TextStyle(color: Colors.white, fontSize: 16)),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          // ignore: deprecated_member_use
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            // ignore: deprecated_member_use
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        ],
      ),
    );
  }

  Widget _buildDeadlineCard(dynamic debt) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        // ignore: deprecated_member_use
        color: Colors.redAccent.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        // ignore: deprecated_member_use
        border: Border.all(color: Colors.redAccent.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          const Icon(Icons.timer_outlined, color: Colors.redAccent, size: 30),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Prochaine échéance', 
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.redAccent)),
                Text(
                  debt.unpaidMonths.isNotEmpty ? 'Mois de ${debt.unpaidMonths.first.month}' : 'À régulariser',
                  style: TextStyle(color: Colors.grey[700], fontSize: 13),
                ),
              ],
            ),
          ),
          Text(
             debt.unpaidMonths.isNotEmpty ? _formatCurrency(debt.unpaidMonths.first.amount) : '',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          ),
        ],
      ),
    );
  }
}