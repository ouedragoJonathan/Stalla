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
      month: json['month'] as String,
      amount: (json['amount'] as num).toInt(),
    );
  }
}

class Debt extends Equatable {
  final int totalPaid;
  final int totalDue;
  final int currentDebt;
  final List<UnpaidMonth> unpaidMonths;
  final String? nextDeadline;

  const Debt({
    required this.totalPaid,
    required this.totalDue,
    required this.currentDebt,
    this.unpaidMonths = const [],
    this.nextDeadline,
  });

  factory Debt.fromJson(Map<String, dynamic> json) {
    int parseInt(dynamic value) {
      if (value is int) return value;
      if (value is double) return value.toInt();
      if (value is String) return int.tryParse(value) ?? 0;
      return 0;
    }

    return Debt(
      totalPaid: parseInt(json['total_paid']),
      totalDue: parseInt(json['total_due']),
      currentDebt: parseInt(json['current_debt']),
      unpaidMonths: (json['unpaid_months'] as List?)
              ?.map((e) => UnpaidMonth.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      nextDeadline: json['next_deadline'] as String?,
    );
  }

  @override
  List<Object?> get props => [totalPaid, totalDue, currentDebt, unpaidMonths, nextDeadline];
}
