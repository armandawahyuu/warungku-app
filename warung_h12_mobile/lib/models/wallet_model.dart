class Wallet {
  final String id;
  final String name;
  final String type;
  final bool isActive;

  Wallet({
    required this.id,
    required this.name,
    required this.type,
    required this.isActive,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      id: json['id'].toString(),
      name: json['name'],
      type: json['type'],
      isActive: json['is_active'] ?? true,
    );
  }
}
