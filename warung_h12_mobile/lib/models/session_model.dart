class Session {
  final String id;
  final String date;
  final String status;
  final List<SessionBalance> balances;

  Session({
    required this.id,
    required this.date,
    required this.status,
    required this.balances,
  });

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      id: json['id'].toString(),
      date: json['date'],
      status: json['status'],
      balances: (json['SessionBalances'] as List?)
              ?.map((b) => SessionBalance.fromJson(b))
              .toList() ??
          [],
    );
  }
}

class SessionBalance {
  final String walletId;
  final double openingBalance;
  final double? closingBalance;
  final double? actualBalance;

  SessionBalance({
    required this.walletId,
    required this.openingBalance,
    this.closingBalance,
    this.actualBalance,
  });

  factory SessionBalance.fromJson(Map<String, dynamic> json) {
    return SessionBalance(
      walletId: json['wallet_id'].toString(),
      openingBalance: double.parse(json['opening_balance'].toString()),
      closingBalance: json['closing_balance'] != null
          ? double.parse(json['closing_balance'].toString())
          : null,
      actualBalance: json['actual_balance'] != null
          ? double.parse(json['actual_balance'].toString())
          : null,
    );
  }
}
