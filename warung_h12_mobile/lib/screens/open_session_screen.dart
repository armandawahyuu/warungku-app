import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../providers/dashboard_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/wallet_model.dart';
import '../utils/number_formatter.dart';

class OpenSessionScreen extends StatefulWidget {
  const OpenSessionScreen({super.key});

  @override
  State<OpenSessionScreen> createState() => _OpenSessionScreenState();
}

class _OpenSessionScreenState extends State<OpenSessionScreen> {
  final ApiService _apiService = ApiService();
  final _formKey = GlobalKey<FormState>();
  final Map<String, TextEditingController> _balanceControllers = {};

  List<Wallet> _wallets = [];
  bool _isLoading = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchWallets();
  }

  Future<void> _fetchWallets() async {
    try {
      final results = await Future.wait([
        _apiService.get('/wallets'),
        _apiService.get('/sessions/last-closed'),
      ]);

      final walletsData = results[0];
      final lastSessionData = results[1];

      setState(() {
        _wallets = (walletsData as List)
            .map((w) => Wallet.fromJson(w))
            .toList();

        // Initialize controllers
        for (var wallet in _wallets) {
          String initialValue = '0';

          // Try to find balance from last session
          if (lastSessionData != null &&
              lastSessionData['SessionBalances'] != null) {
            final balances = lastSessionData['SessionBalances'] as List;
            final balanceData = balances.firstWhere(
              (b) => b['wallet_id'] == wallet.id,
              orElse: () => null,
            );

            if (balanceData != null) {
              double amount = 0;
              if (wallet.type == 'DIGITAL') {
                amount = double.parse(
                  balanceData['closing_balance'].toString(),
                );
              } else {
                amount = double.parse(balanceData['actual_balance'].toString());
              }
              // Format number for display
              initialValue = NumberFormat.currency(
                locale: 'id_ID',
                symbol: '',
                decimalDigits: 0,
              ).format(amount).trim();
            }
          }

          _balanceControllers[wallet.id] = TextEditingController(
            text: initialValue,
          );
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      // Prepare balances
      final balances = _wallets.map((wallet) {
        return {
          'wallet_id': wallet.id,
          'opening_balance': parseFormattedNumber(
            _balanceControllers[wallet.id]!.text,
          ),
        };
      }).toList();

      // Create session
      await _apiService.post('/sessions/open', {
        'date': DateTime.now().toIso8601String().split('T')[0],
        'balances': balances,
      });

      // Refresh dashboard
      if (mounted) {
        final user = Provider.of<AuthProvider>(context, listen: false).user;
        await Provider.of<DashboardProvider>(
          context,
          listen: false,
        ).fetchDashboardData(userRole: user?.role);
        Navigator.pop(context);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Sesi berhasil dibuka!')));
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
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(LucideIcons.store, color: Color(0xFF2563EB)),
            SizedBox(width: 8),
            Text('Buka Warung'),
          ],
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Info Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            LucideIcons.info,
                            color: Color(0xFF2563EB),
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Buka Sesi Baru',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Tanggal: ${DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(DateTime.now())}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Instructions
                    const Text(
                      'Masukkan Saldo Awal',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Hitung uang di setiap dompet dan masukkan jumlahnya',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 16),

                    // Wallet Balance Inputs
                    ..._wallets.map((wallet) {
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
                              controller: _balanceControllers[wallet.id],
                              keyboardType: TextInputType.number,
                              inputFormatters: [
                                ThousandsSeparatorInputFormatter(),
                              ],
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

                    // Submit Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: _isSubmitting ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
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
                            : const Icon(
                                LucideIcons.store,
                                color: Colors.white,
                              ),
                        label: Text(
                          _isSubmitting ? 'Membuka Sesi...' : 'Buka Warung',
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

  @override
  void dispose() {
    for (var controller in _balanceControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }
}
