import 'package:equatable/equatable.dart';

class Payment extends Equatable {
  final int id;
  final int amount;
  final String monthPaid;
  final String date;
  final String? receiptPath;
  final String? method;

  const Payment({
    required this.id,
    required this.amount,
    required this.monthPaid,
    required this.date,
    this.receiptPath,
    this.method,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'],
      amount: json['amount'],
      monthPaid: json['monthPaid'],
      date: json['date'],
      receiptPath: json['receiptPath'],
      method: json['method'],
    );
  }

  @override
  List<Object?> get props => [id, amount, monthPaid, date, receiptPath, method];
}