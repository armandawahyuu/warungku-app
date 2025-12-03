import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../models/transaction_model.dart';

class TransactionItem extends StatelessWidget {
  final Transaction transaction;

  const TransactionItem({super.key, required this.transaction});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    final timeFormatter = DateFormat('HH:mm');
    
    IconData icon;
    Color color;
    String subtitle;

    switch (transaction.type) {
      case 'INCOME':
        icon = LucideIcons.arrowDownCircle;
        color = Colors.green;
        subtitle = transaction.categoryName ?? 'Pemasukan';
        break;
      case 'EXPENSE':
        icon = LucideIcons.arrowUpCircle;
        color = Colors.red;
        subtitle = transaction.categoryName ?? 'Pengeluaran';
        break;
      case 'TRANSFER':
        icon = LucideIcons.arrowRightLeft;
        color = Colors.blue;
        subtitle = '${transaction.fromWalletName} → ${transaction.toWalletName}';
        break;
      default:
        icon = LucideIcons.helpCircle;
        color = Colors.grey;
        subtitle = 'Unknown';
    }

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withOpacity(0.1),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(
        transaction.description ?? subtitle,
        style: const TextStyle(fontWeight: FontWeight.w500),
      ),
      subtitle: Text(
        '${timeFormatter.format(DateTime.parse(transaction.createdAt))} • $subtitle',
        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
      ),
      trailing: Text(
        formatter.format(transaction.amount),
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: transaction.type == 'INCOME' ? Colors.green : Colors.red,
        ),
      ),
    );
  }
}
