import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../providers/vendor_provider.dart';
import '../widgets/custom_card.dart';
import '../widgets/info_row.dart';
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
    return '${formatter.format(amount)} FCFA';
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return '-';
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd MMM yyyy', 'fr_FR').format(date);
    } catch (e) {
      return dateString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<VendorProvider>(
          builder: (context, vendorProvider, _) {
            if (vendorProvider.isLoading && vendorProvider.profile == null) {
              return const LoadingWidget(message: 'Chargement...');
            }

            if (vendorProvider.errorMessage != null && vendorProvider.profile == null) {
              return ErrorDisplay(
                message: vendorProvider.errorMessage!,
                onRetry: _loadData,
              );
            }

            final profile = vendorProvider.profile;
            final debt = vendorProvider.debt;

            return RefreshIndicator(
              onRefresh: _loadData,
              color: AppColors.orangePantone,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Text(
                      'Bienvenue,',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      profile?.user.name ?? 'Utilisateur',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 24),

                    // Stand actuel
                    if (profile?.stand != null)
                      CustomCard(
                        gradient: const LinearGradient(
                          colors: [AppColors.orangePantone, AppColors.pumpkin],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'STAND ACTUEL',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    // ignore: deprecated_member_use
                                    color: AppColors.white.withOpacity(0.8),
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 1,
                                  ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              profile!.stand!.code,
                              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                    color: AppColors.white,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              profile.stand!.zone,
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    // ignore: deprecated_member_use
                                    color: AppColors.white.withOpacity(0.9),
                                  ),
                            ),
                          ],
                        ),
                      ),

                    // Prochaine échéance
                    if (debt != null && debt.totalDue > 0)
                      CustomCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'PROCHAINE ÉCHÉANCE',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.sandyBrown,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1,
                                  ),
                            ),
                            const SizedBox(height: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  debt.unpaidMonths.isNotEmpty
                                      ? _formatCurrency(debt.unpaidMonths.first.amount)
                                      : '0 FCFA',
                                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                        color: AppColors.orangePantone,
                                      ),
                                ),
                                if (debt.nextDeadline != null)
                                  Text(
                                    _formatDate(debt.nextDeadline),
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          fontWeight: FontWeight.w600,
                                        ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),

                    // Statut rapide
                    CustomCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'STATUT RAPIDE',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.sandyBrown,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1,
                                ),
                          ),
                          const SizedBox(height: 16),
                          InfoRow(
                            label: 'Dette totale',
                            value: debt != null ? _formatCurrency(debt.totalDue) : '0 FCFA',
                            valueColor: debt != null && debt.totalDue > 0
                                ? AppColors.orangePantone
                                : AppColors.success,
                          ),
                          InfoRow(
                            label: 'Loyer mensuel',
                            value: profile?.stand != null
                                ? _formatCurrency(profile!.stand!.monthlyRent)
                                : '-',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}