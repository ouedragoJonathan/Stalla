import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../providers/vendor_provider.dart';
import '../widgets/custom_card.dart';

class DebtsScreen extends StatelessWidget {
  const DebtsScreen({super.key});

  String _formatCurrency(int amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(amount)} FCFA';
  }

  String _formatMonth(String monthString) {
    try {
      final date = DateTime.parse('$monthString-01');
      return DateFormat('MMMM yyyy', 'fr_FR').format(date);
    } catch (e) {
      return monthString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<VendorProvider>(
          builder: (context, vendorProvider, _) {
            final debt = vendorProvider.debt;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Text(
                    'Mes Dettes',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Suivi des impayés',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),

                  // Total à régler
                  CustomCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'TOTAL À RÉGLER',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.sandyBrown,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1,
                              ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          debt != null ? _formatCurrency(debt.totalDue) : '0 FCFA',
                          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                color: debt != null && debt.totalDue > 0
                                    ? AppColors.orangePantone
                                    : AppColors.success,
                              ),
                        ),
                      ],
                    ),
                  ),

                  // Mois impayés
                  if (debt != null && debt.unpaidMonths.isNotEmpty) ...[
                    Text(
                      'Mois impayés',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 12),
                    CustomCard(
                      padding: const EdgeInsets.all(0),
                      child: ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: debt.unpaidMonths.length,
                        separatorBuilder: (context, index) => const Divider(
                          height: 1,
                          color: AppColors.lightYellow,
                        ),
                        itemBuilder: (context, index) {
                          final unpaidMonth = debt.unpaidMonths[index];
                          return Padding(
                            padding: const EdgeInsets.all(20),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _formatMonth(unpaidMonth.month),
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textDark,
                                          ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Loyer mensuel',
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            color: AppColors.textMuted,
                                          ),
                                    ),
                                  ],
                                ),
                                Text(
                                  _formatCurrency(unpaidMonth.amount),
                                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textDark,
                                      ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ] else
                    CustomCard(
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              const Icon(
                                Icons.check_circle_outline,
                                size: 64,
                                color: AppColors.success,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Aucune dette',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Tous vos paiements sont à jour !',
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
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