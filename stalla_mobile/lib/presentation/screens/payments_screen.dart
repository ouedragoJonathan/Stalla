import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../providers/payment_provider.dart';
import '../widgets/custom_card.dart';
import '../widgets/loading_widget.dart';
import '../widgets/error_widget.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PaymentProvider>().fetchPayments();
    });
  }

  String _formatCurrency(int amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(amount)} F';
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd MMM yyyy', 'fr_FR').format(date);
    } catch (e) {
      return dateString;
    }
  }

  String _formatMonth(String monthString) {
    try {
      final date = DateTime.parse('$monthString-01');
      return DateFormat('MMMM yyyy', 'fr_FR').format(date);
    } catch (e) {
      return monthString;
    }
  }

  String _getPaymentMethodLabel(String? method) {
    switch (method?.toUpperCase()) {
      case 'CASH':
        return 'Cash';
      case 'ORANGE_MONEY':
        return 'Orange Money';
      case 'MOOV_MONEY':
        return 'Moov Money';
      default:
        return 'Autre';
    }
  }

  Future<void> _downloadReceipt(String receiptPath) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Fonctionnalité de téléchargement à venir'),
        backgroundColor: AppColors.orangePantone,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<PaymentProvider>(
          builder: (context, paymentProvider, _) {
            if (paymentProvider.isLoading && paymentProvider.payments.isEmpty) {
              return const LoadingWidget(message: 'Chargement des paiements...');
            }

            if (paymentProvider.errorMessage != null && paymentProvider.payments.isEmpty) {
              return ErrorDisplay(
                message: paymentProvider.errorMessage!,
                onRetry: () => paymentProvider.fetchPayments(),
              );
            }

            final payments = paymentProvider.payments;

            return RefreshIndicator(
              onRefresh: () => paymentProvider.fetchPayments(),
              color: AppColors.orangePantone,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Text(
                      'Historique',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Paiements effectués',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 24),

                    if (payments.isEmpty)
                      CustomCard(
                        child: Center(
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              children: [
                                const Icon(
                                  Icons.receipt_long_outlined,
                                  size: 64,
                                  color: AppColors.lightOrange,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Aucun paiement',
                                  style: Theme.of(context).textTheme.titleMedium,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Votre historique de paiements apparaîtra ici',
                                  textAlign: TextAlign.center,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ],
                            ),
                          ),
                        ),
                      )
                    else
                      CustomCard(
                        padding: const EdgeInsets.all(0),
                        child: ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: payments.length,
                          separatorBuilder: (context, index) => const Divider(
                            height: 1,
                            color: AppColors.lightYellow,
                          ),
                          itemBuilder: (context, index) {
                            final payment = payments[index];
                            return Padding(
                              padding: const EdgeInsets.all(20),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          _formatMonth(payment.monthPaid),
                                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.textDark,
                                              ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${_formatDate(payment.date)} • ${_getPaymentMethodLabel(payment.method)}',
                                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                color: AppColors.textMuted,
                                              ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        _formatCurrency(payment.amount),
                                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                              fontWeight: FontWeight.w700,
                                              color: AppColors.textDark,
                                            ),
                                      ),
                                      if (payment.receiptPath != null) ...[
                                        const SizedBox(height: 4),
                                        GestureDetector(
                                          onTap: () => _downloadReceipt(payment.receiptPath!),
                                          child: Text(
                                            'REÇU PDF',
                                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                  color: AppColors.pumpkin,
                                                  fontWeight: FontWeight.w700,
                                                  fontSize: 11,
                                                ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
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