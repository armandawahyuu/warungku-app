import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../providers/dashboard_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../utils/number_formatter.dart';

class CloseSessionScreen extends StatefulWidget {
  const CloseSessionScreen({super.key});

  @override
  State<CloseSessionScreen> createState() => _CloseSessionScreenState();
}

class _CloseSessionScreenState extends State<CloseSessionScreen> {
  final ApiService _apiService = ApiService();
  final _formKey = GlobalKey<FormState>();
  final Map<String, TextEditingController> _actualBalanceControllers = {};

  int _currentStep = 1; // 1: Input, 2: Review
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final dashboard = Provider.of<DashboardProvider>(context, listen: false);

    // Initialize controllers with current calculated balances
    for (var wallet in dashboard.wallets) {
      final currentBalance = dashboard.getWalletBalance(wallet.id);
      _actualBalanceControllers[wallet.id] = TextEditingController(
        text: currentBalance.toStringAsFixed(0),
      );
    }
  }

  void _goToReview() {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _currentStep = 2);
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);

    try {
      final dashboard = Provider.of<DashboardProvider>(context, listen: false);

      // Prepare cash counts (actual balances)
      final cashCounts = dashboard.wallets.map((wallet) {
        return {
          'drawer': wallet.name,
          'actual_amount': parseFormattedNumber(
            _actualBalanceControllers[wallet.id]!.text,
          ),
        };
      }).toList();

      // Close session
      await _apiService.post(
        '/sessions/${dashboard.currentSession!.id}/close',
        {'cash_counts': cashCounts},
      );

      if (mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sesi berhasil ditutup. Terima kasih!'),
            backgroundColor: Colors.green,
          ),
        );

        // Logout user and clear data
        await Provider.of<AuthProvider>(context, listen: false).logout();
        Provider.of<DashboardProvider>(context, listen: false).clearData();

        // Navigate back to login (handled by auth wrapper usually, but pop to be safe)
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = Provider.of<DashboardProvider>(context);

    if (dashboard.currentSession == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Tutup Warung')),
        body: const Center(child: Text('Tidak ada sesi aktif')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(LucideIcons.store, color: Colors.red),
            const SizedBox(width: 8),
            Text(_currentStep == 1 ? 'Tutup Warung (1/2)' : 'Konfirmasi (2/2)'),
          ],
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () {
            if (_currentStep == 2) {
              setState(() => _currentStep = 1);
            } else {
              Navigator.pop(context);
            }
          },
        ),
      ),
      body: _currentStep == 1
          ? _buildInputStep(dashboard)
          : _buildReviewStep(dashboard),
    );
  }

  Widget _buildInputStep(DashboardProvider dashboard) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Warning Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Row(
                children: [
                  Icon(LucideIcons.info, color: Colors.blue.shade700, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Silakan hitung dan masukkan jumlah uang aktual di setiap dompet.',
                      style: TextStyle(
                        color: Colors.blue.shade700,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Input Saldo Aktual',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            ...dashboard.wallets.map((wallet) {
              IconData icon;
              Color color;

              if (wallet.type == 'DIGITAL') {
                icon = LucideIcons.smartphone;
                color = const Color(0xFF9333EA);
              } else {
                icon = LucideIcons.wallet;
                color = const Color(0xFF2563EB);
              }

              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(icon, size: 20, color: color),
                        const SizedBox(width: 8),
                        Text(
                          wallet.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _actualBalanceControllers[wallet.id],
                      keyboardType: TextInputType.number,
                      inputFormatters: [ThousandsSeparatorInputFormatter()],
                      decoration: InputDecoration(
                        prefixText: 'Rp ',
                        hintText: '0',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        filled: true,
                        fillColor: Colors.grey.shade50,
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty)
                          return 'Wajib diisi';
                        final number = parseFormattedNumber(value);
                        if (number < 0) return 'Tidak boleh negatif';
                        return null;
                      },
                    ),
                  ],
                ),
              );
            }),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _goToReview,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Lanjut Review',
                  style: TextStyle(
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
    );
  }

  Widget _buildReviewStep(DashboardProvider dashboard) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    bool hasDifference = false;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Review Penutupan',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Periksa kembali selisih saldo sebelum menutup warung.',
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(height: 24),

          // Summary Cards
          ...dashboard.wallets.map((wallet) {
            final systemBalance = dashboard.getWalletBalance(wallet.id);
            final actualBalance = parseFormattedNumber(
              _actualBalanceControllers[wallet.id]!.text,
            );
            final diff = actualBalance - systemBalance;

            if (diff != 0) hasDifference = true;

            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: diff == 0
                      ? Colors.grey.shade200
                      : Colors.orange.shade200,
                  width: diff == 0 ? 1 : 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        wallet.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      if (diff != 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.orange.shade100,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'Selisih',
                            style: TextStyle(
                              color: Colors.orange,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const Divider(height: 24),
                  _buildSummaryRow('Di Sistem', systemBalance, formatter),
                  const SizedBox(height: 8),
                  _buildSummaryRow('Aktual', actualBalance, formatter),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Selisih',
                        style: TextStyle(color: Colors.grey),
                      ),
                      Text(
                        diff == 0
                            ? '-'
                            : (diff > 0
                                  ? '+${formatter.format(diff)}'
                                  : formatter.format(diff)),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: diff == 0
                              ? Colors.grey
                              : (diff > 0 ? Colors.green : Colors.red),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),

          if (hasDifference)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.orange.shade200),
              ),
              child: Row(
                children: [
                  Icon(
                    LucideIcons.alertTriangle,
                    color: Colors.orange.shade700,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Terdapat selisih saldo. Pastikan alasan selisih sudah diketahui sebelum melanjutkan.',
                      style: TextStyle(
                        color: Colors.orange.shade700,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Icon(LucideIcons.checkCircle, color: Colors.white),
              label: Text(
                _isSubmitting ? 'Memproses...' : 'Konfirmasi Tutup Warung',
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
    );
  }

  Widget _buildSummaryRow(String label, double amount, NumberFormat formatter) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey)),
        Text(
          formatter.format(amount),
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  @override
  void dispose() {
    for (var controller in _actualBalanceControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }
}
