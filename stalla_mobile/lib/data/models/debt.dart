import 'package:equatable/equatable.dart';

class UnpaidMonth {
  final String month;
  final int amount;

  const UnpaidMonth({
    required this.month,
    required this.amount,
  });

  factory UnpaidMonth.fromJson(Map<String, dynamic> json) {
    return UnpaidMonth(
      month: json['month'],
      amount: json['amount'],
    );
  }
}

class Debt extends Equatable {
  final int totalDue;
  final List<UnpaidMonth> unpaidMonths;
  final String? nextDeadline;

  const Debt({
    required this.totalDue,
    required this.unpaidMonths,
    this.nextDeadline,
  });

  factory Debt.fromJson(Map<String, dynamic> json) {
    return Debt(
      totalDue: json['total_due'] ?? 0,
      unpaidMonths: (json['unpaid_months'] as List?)
              ?.map((e) => UnpaidMonth.fromJson(e))
              .toList() ??
          [],
      nextDeadline: json['next_deadline'],
    );
  }

  @override
  List<Object?> get props => [totalDue, unpaidMonths, nextDeadline];
}