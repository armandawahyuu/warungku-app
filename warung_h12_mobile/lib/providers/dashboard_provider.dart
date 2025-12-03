import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/wallet_model.dart';
import '../models/session_model.dart';
import '../models/transaction_model.dart';

class DashboardProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Session? _currentSession;
  List<Wallet> _wallets = [];
  List<Transaction> _transactions = [];
  bool _isLoading = false;
  String? _error;
  bool _isClosedView = false;

  Session? get currentSession => _currentSession;
  List<Wallet> get wallets => _wallets;
  List<Transaction> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasSession => _currentSession != null;
  bool get isClosedView => _isClosedView;

  Future<void> fetchDashboardData({String? userRole}) async {
    _isLoading = true;
    _error = null;
    _isClosedView = false;
    notifyListeners();

    try {
      // Fetch current session
      final sessionData = await _apiService.get('/sessions/current');
      if (sessionData != null) {
        _currentSession = Session.fromJson(sessionData);
        
        // Fetch transactions for this session
        final transactionsData = await _apiService.get('/transactions?session_id=${_currentSession!.id}');
        _transactions = (transactionsData as List)
            .map((t) => Transaction.fromJson(t))
            .toList();
      } else if (userRole == 'ADMIN') {
        // If Admin and no open session, fetch last closed session
        try {
          final lastSessionData = await _apiService.get('/sessions/last-closed');
          if (lastSessionData != null) {
            _currentSession = Session.fromJson(lastSessionData);
            _isClosedView = true;
            
            // Fetch transactions for that last session
            final transactionsData = await _apiService.get('/transactions?session_id=${_currentSession!.id}');
            _transactions = (transactionsData as List)
                .map((t) => Transaction.fromJson(t))
                .toList();
          }
        } catch (e) {
          // If no last closed session, that's okay - just leave session as null
          _currentSession = null;
        }
      }

      // Fetch wallets
      final walletsData = await _apiService.get('/wallets');
      _wallets = (walletsData as List)
          .map((w) => Wallet.fromJson(w))
          .toList();

    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  double getWalletBalance(String walletId) {
    if (_currentSession == null) return 0.0;
    
    final balance = _currentSession!.balances.firstWhere(
      (b) => b.walletId == walletId,
      orElse: () => SessionBalance(walletId: walletId, openingBalance: 0.0),
    );

    // Calculate current balance
    double currentBalance = balance.openingBalance;
    
    for (var transaction in _transactions) {
      if (transaction.type == 'INCOME' && transaction.toWalletId != null) {
        if (transaction.toWalletId == walletId) {
          currentBalance += transaction.amount;
        }
      } else if (transaction.type == 'EXPENSE' && transaction.fromWalletId != null) {
        if (transaction.fromWalletId == walletId) {
          currentBalance -= transaction.amount;
        }
      } else if (transaction.type == 'TRANSFER') {
        if (transaction.fromWalletId != null) {
          if (transaction.fromWalletId == walletId) {
            currentBalance -= transaction.amount;
          }
        }
        if (transaction.toWalletId != null) {
          if (transaction.toWalletId == walletId) {
            currentBalance += transaction.amount;
          }
        }
      }
    }

    return currentBalance;
  }

  void clearData() {
    _currentSession = null;
    _wallets = [];
    _transactions = [];
    notifyListeners();
  }
}
