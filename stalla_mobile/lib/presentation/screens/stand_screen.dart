import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../providers/vendor_provider.dart';
import '../widgets/custom_card.dart';
import '../widgets/info_row.dart';

class StandScreen extends StatelessWidget {
  const StandScreen({super.key});

  String _formatCurrency(int amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(amount)} FCFA';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<VendorProvider>(
          builder: (context, vendorProvider, _) {
            final stand = vendorProvider.profile?.stand;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Text(
                    'Mon Stand',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Informations techniques',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),

                  if (stand != null) ...[
                    // Détails du stand
                    CustomCard(
                      child: Column(
                        children: [
                          InfoRow(
                            label: 'Code stand',
                            value: stand.code,
                          ),
                          InfoRow(
                            label: 'Zone',
                            value: stand.zone,
                          ),
                          InfoRow(
                            label: 'Surface',
                            value: '${stand.surface} m²',
                          ),
                          InfoRow(
                            label: 'Loyer mensuel',
                            value: _formatCurrency(stand.monthlyRent),
                            valueColor: AppColors.orangePantone,
                          ),
                        ],
                      ),
                    ),

                    // Info importante
                    CustomCard(
                      backgroundColor: AppColors.lightOrange,
                      child: Row(
                        children: [
                          const Icon(
                            Icons.info_outline,
                            color: AppColors.pumpkin,
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Le loyer est dû avant le 5 de chaque mois. En cas de retard, veuillez contacter l\'administration.',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    fontSize: 13,
                                    height: 1.5,
                                  ),
                            ),
                          ),
                        ],
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
                                Icons.store_outlined,
                                size: 64,
                                color: AppColors.lightOrange,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Aucun stand assigné',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Contactez l\'administration pour obtenir un stand',
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