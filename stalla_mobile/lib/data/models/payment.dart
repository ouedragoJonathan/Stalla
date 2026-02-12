import 'package:equatable/equatable.dart';

class Payment extends Equatable {
  final int id;
  final int amount;
  final String monthPaid;
  final String date;
  final String? stallCode;
  final String? zone;

  const Payment({
    required this.id,
    required this.amount,
    required this.monthPaid,
    required this.date,
    this.stallCode,
    this.zone,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as int,
      amount: (json['amount_paid'] as num).toInt(),
      monthPaid: (json['period'] ?? '') as String,
      date: (json['payment_date'] ?? '') as String,
      stallCode: json['stall_code'] as String?,
      zone: json['zone'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, amount, monthPaid, date, stallCode, zone];
}
