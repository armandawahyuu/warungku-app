import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/balance_card.dart';
import '../widgets/transaction_item.dart';
import 'transaction_form_screen.dart';
import 'open_session_screen.dart';
import 'close_session_screen.dart';
import 'category_management_screen.dart';
import 'wallet_management_screen.dart';
import 'user_management_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = Provider.of<AuthProvider>(context, listen: false).user;
      Provider.of<DashboardProvider>(context, listen: false)
          .fetchDashboardData(userRole: user?.role);
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    final dashboard = Provider.of<DashboardProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Color(0xFF2563EB),
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.store, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            const Text('Warung H12', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          if (dashboard.isClosedView)
            Container(
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  Icon(LucideIcons.store, color: Colors.red.shade700, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    'Warung Tutup',
                    style: TextStyle(
                      color: Colors.red.shade700,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
      drawer: _buildDrawer(context, user, dashboard),
      body: dashboard.isLoading
          ? const Center(child: CircularProgressIndicator())
          : dashboard.error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(LucideIcons.alertCircle, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('Error: ${dashboard.error}'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          final user = Provider.of<AuthProvider>(context, listen: false).user;
                          dashboard.fetchDashboardData(userRole: user?.role);
                        },
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : !dashboard.hasSession && user?.role != 'ADMIN'
                  ? _buildNoSessionView(context)
                  : RefreshIndicator(
                      onRefresh: () {
                        final authUser = Provider.of<AuthProvider>(context, listen: false).user;
                        return dashboard.fetchDashboardData(userRole: authUser?.role);
                      },
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Session Info
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: Row(
                                children: [
                                  const Icon(LucideIcons.calendar, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Sesi: ${DateTime.parse(dashboard.currentSession!.date).toString().split(' ')[0]}',
                                    style: const TextStyle(fontWeight: FontWeight.w500),
                                  ),
                                  const Spacer(),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.green.shade50,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      dashboard.currentSession!.status,
                                      style: TextStyle(
                                        color: Colors.green.shade700,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Quick Actions - Hide if closed view
                            if (!dashboard.isClosedView) ...[
                            const Text(
                              'Aksi Cepat',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: _buildQuickAction(
                                    context,
                                    'Pemasukan',
                                    LucideIcons.arrowDownCircle,
                                    Colors.green,
                                    'INCOME',
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _buildQuickAction(
                                    context,
                                    'Pengeluaran',
                                    LucideIcons.arrowUpCircle,
                                    Colors.red,
                                    'EXPENSE',
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _buildQuickAction(
                                    context,
                                    'Transfer',
                                    LucideIcons.arrowRightLeft,
                                    Colors.blue,
                                    'TRANSFER',
                                  ),
                                ),
                              ],
                            ),
                            if (user?.role == 'KASIR') ...[
                              const SizedBox(height: 12),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => const CloseSessionScreen(),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red.shade50,
                                    foregroundColor: Colors.red,
                                    elevation: 0,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      side: BorderSide(color: Colors.red.shade200),
                                    ),
                                  ),
                                  icon: const Icon(LucideIcons.store),
                                  label: const Text('Tutup Warung'),
                                ),
                              ),
                            ],
                            const SizedBox(height: 24),
                            ],

                            // Balance Cards
                            Text(
                              dashboard.isClosedView ? 'Saldo Terakhir (Tutup Warung)' : 'Saldo Saat Ini',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 12),
                            GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                                childAspectRatio: 1.5,
                              ),
                              itemCount: dashboard.wallets.length,
                              itemBuilder: (context, index) {
                                final wallet = dashboard.wallets[index];
                                final balance = dashboard.getWalletBalance(wallet.id);
                                
                                Color color;
                                IconData icon;
                                
                                if (wallet.type == 'DIGITAL') {
                                  icon = LucideIcons.smartphone;
                                  color = index % 3 == 0
                                      ? const Color(0xFF9333EA)
                                      : index % 3 == 1
                                          ? const Color(0xFF0EA5E9)
                                          : const Color(0xFFF97316);
                                } else {
                                  icon = LucideIcons.wallet;
                                  color = index % 2 == 0
                                      ? const Color(0xFF2563EB)
                                      : const Color(0xFF10B981);
                                }

                                return BalanceCard(
                                  title: wallet.name,
                                  amount: balance,
                                  icon: icon,
                                  color: color,
                                );
                              },
                            ),
                            const SizedBox(height: 24),

                            // Recent Transactions
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Transaksi Terbaru',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  '${dashboard.transactions.length} transaksi',
                                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            dashboard.transactions.isEmpty
                                ? Container(
                                    padding: const EdgeInsets.all(32),
                                    decoration: BoxDecoration(
                                      color: Colors.grey.shade50,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Center(
                                      child: Column(
                                        children: [
                                          Icon(LucideIcons.inbox, size: 48, color: Colors.grey),
                                          SizedBox(height: 8),
                                          Text(
                                            'Belum ada transaksi',
                                            style: TextStyle(color: Colors.grey),
                                          ),
                                        ],
                                      ),
                                    ),
                                  )
                                : Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: Colors.grey.shade200),
                                    ),
                                    child: ListView.separated(
                                      shrinkWrap: true,
                                      physics: const NeverScrollableScrollPhysics(),
                                      itemCount: dashboard.transactions.length,
                                      separatorBuilder: (context, index) => const Divider(height: 1),
                                      itemBuilder: (context, index) {
                                        return TransactionItem(
                                          transaction: dashboard.transactions[index],
                                        );
                                      },
                                    ),
                                  ),
                          ],
                        ),
                      ),
                    ),
    );
  }

  Widget _buildNoSessionView(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey.shade200, width: 2),
              ),
              child: const Icon(LucideIcons.store, size: 40, color: Color(0xFF2563EB)),
            ),
            const SizedBox(height: 24),
            const Text(
              'Warung H12 Financial',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Warung belum dibuka hari ini.\nSilahkan buka sesi baru untuk mulai mencatat.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const OpenSessionScreen(),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(LucideIcons.store, color: Colors.white),
                label: const Text(
                  'Buka Warung Sekarang',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: () {
                Provider.of<AuthProvider>(context, listen: false).logout();
              },
              icon: const Icon(LucideIcons.logOut, color: Colors.red),
              label: const Text('Logout', style: TextStyle(color: Colors.red)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, dynamic user, DashboardProvider dashboard) {
    return Drawer(
      child: Column(
        children: [
          // Drawer Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF2563EB), Color(0xFF1E40AF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: const Icon(LucideIcons.user, color: Color(0xFF2563EB), size: 30),
                ),
                const SizedBox(height: 16),
                Text(
                  user?.username ?? 'User',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.role ?? 'ROLE',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          
          // Menu Items
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                ListTile(
                  leading: const Icon(LucideIcons.layoutDashboard, color: Color(0xFF2563EB)),
                  title: const Text('Dashboard'),
                  onTap: () {
                    Navigator.pop(context);
                  },
                ),
                if (dashboard.hasSession)
                  ListTile(
                    leading: const Icon(LucideIcons.store, color: Colors.red),
                    title: const Text('Tutup Warung'),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const CloseSessionScreen(),
                        ),
                      );
                    },
                  ),
                const Divider(),
                ListTile(
                  leading: const Icon(LucideIcons.tag, color: Color(0xFF10B981)),
                  title: const Text('Kategori'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const CategoryManagementScreen(),
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(LucideIcons.wallet, color: Color(0xFF9333EA)),
                  title: const Text('Dompet'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const WalletManagementScreen(),
                      ),
                    );
                  },
                ),
                if (user?.role == 'ADMIN')
                  ListTile(
                    leading: const Icon(LucideIcons.users, color: Color(0xFFEF4444)),
                    title: const Text('Kelola User'),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const UserManagementScreen(),
                        ),
                      );
                    },
                  ),
                const Divider(),
              ],
            ),
          ),
          
          // Logout Button
          Container(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  Provider.of<AuthProvider>(context, listen: false).logout();
                  Provider.of<DashboardProvider>(context, listen: false).clearData();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: const Icon(LucideIcons.logOut, color: Colors.white),
                label: const Text(
                  'Logout',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAction(
    BuildContext context,
    String label,
    IconData icon,
    Color color,
    String type,
  ) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TransactionFormScreen(type: type),
          ),
        );
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
