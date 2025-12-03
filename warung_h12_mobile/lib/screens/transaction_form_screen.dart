import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../providers/transaction_provider.dart';
import '../providers/dashboard_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/number_formatter.dart';

class TransactionFormScreen extends StatefulWidget {
  final String type; // INCOME, EXPENSE, TRANSFER

  const TransactionFormScreen({super.key, required this.type});

  @override
  State<TransactionFormScreen> createState() => _TransactionFormScreenState();
}

class _TransactionFormScreenState extends State<TransactionFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  String? _selectedCategoryId;
  String? _selectedFromWalletId;
  String? _selectedToWalletId;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TransactionProvider>(context, listen: false).fetchFormData();
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final dashboard = Provider.of<DashboardProvider>(context, listen: false);
    if (dashboard.currentSession == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tidak ada sesi aktif')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final success = await Provider.of<TransactionProvider>(context, listen: false)
        .createTransaction(
      sessionId: dashboard.currentSession!.id,
      type: widget.type,
      amount: parseFormattedNumber(_amountController.text),
      categoryId: _selectedCategoryId,
      fromWalletId: _selectedFromWalletId,
      toWalletId: _selectedToWalletId,
      description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
    );

    setState(() => _isSubmitting = false);

    if (success) {
      // Refresh dashboard
      final user = Provider.of<AuthProvider>(context, listen: false).user;
      await dashboard.fetchDashboardData(userRole: user?.role);
      
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Transaksi berhasil disimpan')),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal: ${Provider.of<TransactionProvider>(context, listen: false).error}'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final transactionProvider = Provider.of<TransactionProvider>(context);
    
    String title;
    IconData icon;
    Color color;

    switch (widget.type) {
      case 'INCOME':
        title = 'Catat Pemasukan';
        icon = LucideIcons.arrowDownCircle;
        color = Colors.green;
        break;
      case 'EXPENSE':
        title = 'Catat Pengeluaran';
        icon = LucideIcons.arrowUpCircle;
        color = Colors.red;
        break;
      case 'TRANSFER':
        title = 'Transfer Dana';
        icon = LucideIcons.arrowRightLeft;
        color = Colors.blue;
        break;
      default:
        title = 'Transaksi';
        icon = LucideIcons.fileText;
        color = Colors.grey;
    }

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 8),
            Text(title),
          ],
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: transactionProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Amount
                    const Text(
                      'Jumlah',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _amountController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [ThousandsSeparatorInputFormatter()],
                      decoration: InputDecoration(
                        prefixText: 'Rp ',
                        hintText: '0',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) return 'Wajib diisi';
                        final number = parseFormattedNumber(value);
                        if (number <= 0) return 'Harus lebih dari 0';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Category (for INCOME and EXPENSE)
                    if (widget.type != 'TRANSFER') ...[
                      const Text(
                        'Kategori',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _selectedCategoryId,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        hint: const Text('Pilih Kategori'),
                        items: transactionProvider
                            .getCategoriesByType(widget.type)
                            .map((category) => DropdownMenuItem(
                                  value: category.id,
                                  child: Text(category.name),
                                ))
                            .toList(),
                        onChanged: (value) {
                          setState(() => _selectedCategoryId = value);
                        },
                        validator: (value) => value == null ? 'Wajib dipilih' : null,
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Wallet selection
                    if (widget.type == 'INCOME' || widget.type == 'EXPENSE') ...[
                      Text(
                        widget.type == 'INCOME' ? 'Masuk ke Dompet' : 'Dari Dompet',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: widget.type == 'INCOME' ? _selectedToWalletId : _selectedFromWalletId,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        hint: const Text('Pilih Dompet'),
                        items: transactionProvider.wallets
                            .map((wallet) => DropdownMenuItem(
                                  value: wallet.id,
                                  child: Text(wallet.name),
                                ))
                            .toList(),
                        onChanged: (value) {
                          setState(() {
                            if (widget.type == 'INCOME') {
                              _selectedToWalletId = value;
                            } else {
                              _selectedFromWalletId = value;
                            }
                          });
                        },
                        validator: (value) => value == null ? 'Wajib dipilih' : null,
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Transfer wallets
                    if (widget.type == 'TRANSFER') ...[
                      const Text(
                        'Dari Dompet',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _selectedFromWalletId,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        hint: const Text('Pilih Dompet Asal'),
                        items: transactionProvider.wallets
                            .map((wallet) => DropdownMenuItem(
                                  value: wallet.id,
                                  child: Text(wallet.name),
                                ))
                            .toList(),
                        onChanged: (value) {
                          setState(() => _selectedFromWalletId = value);
                        },
                        validator: (value) => value == null ? 'Wajib dipilih' : null,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Ke Dompet',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _selectedToWalletId,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        hint: const Text('Pilih Dompet Tujuan'),
                        items: transactionProvider.wallets
                            .where((w) => w.id != _selectedFromWalletId)
                            .map((wallet) => DropdownMenuItem(
                                  value: wallet.id,
                                  child: Text(wallet.name),
                                ))
                            .toList(),
                        onChanged: (value) {
                          setState(() => _selectedToWalletId = value);
                        },
                        validator: (value) => value == null ? 'Wajib dipilih' : null,
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Description
                    const Text(
                      'Keterangan (Opsional)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _descriptionController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Tambahkan keterangan...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Submit Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: color,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isSubmitting
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(
                                'Simpan Transaksi',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
