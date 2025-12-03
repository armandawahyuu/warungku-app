class Transaction {
  final String id;
  final String type;
  final double amount;
  final String? description;
  final String? categoryName;
  final String? fromWalletName;
  final String? toWalletName;
  final String? fromWalletId;
  final String? toWalletId;
  final String createdAt;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    this.description,
    this.categoryName,
    this.fromWalletName,
    this.toWalletName,
    this.fromWalletId,
    this.toWalletId,
    required this.createdAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'].toString(),
      type: json['type'],
      amount: double.parse(json['amount'].toString()),
      description: json['description'],
      categoryName: json['category'], // Backend returns name directly in category field
      fromWalletName: json['FromWallet']?['name'],
      toWalletName: json['ToWallet']?['name'],
      fromWalletId: json['source_wallet'],
      toWalletId: json['destination_wallet'],
      createdAt: json['createdAt'],
    );
  }
}
