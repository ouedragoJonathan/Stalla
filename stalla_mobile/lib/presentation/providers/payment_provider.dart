import 'package:flutter/foundation.dart';
import '../../data/models/payment.dart';
import '../../data/repositories/payment_repository.dart';

class PaymentProvider extends ChangeNotifier {
  final _paymentRepository = PaymentRepository();

  List<Payment> _payments = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Payment> get payments => _payments;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchPayments() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final response = await _paymentRepository.getPayments();

    if (response.success && response.data != null) {
      _payments = response.data!;
    } else {
      _errorMessage = response.message;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<String?> getReceiptUrl(String receiptPath) async {
    return await _paymentRepository.downloadReceipt(receiptPath);
  }

  void clearData() {
    _payments = [];
    _errorMessage = null;
    notifyListeners();
  }
}