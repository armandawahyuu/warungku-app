import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/category_model.dart';
import '../models/wallet_model.dart';

class TransactionProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Category> _categories = [];
  List<Wallet> _wallets = [];
  bool _isLoading = false;
  String? _error;

  List<Category> get categories => _categories;
  List<Wallet> get wallets => _wallets;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Category> getCategoriesByType(String type) {
    return _categories.where((c) => c.type == type).toList();
  }

  Future<void> fetchFormData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Fetch categories
      final categoriesData = await _apiService.get('/categories');
      _categories = (categoriesData as List)
          .map((c) => Category.fromJson(c))
          .toList();

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

  Future<bool> createTransaction({
    required String sessionId,
    required String type,
    required double amount,
    String? categoryId,
    String? fromWalletId,
    String? toWalletId,
    String? description,
  }) async {
    String? categoryName;
    if (categoryId != null) {
      try {
        final category = _categories.firstWhere((c) => c.id == categoryId);
        categoryName = category.name;
      } catch (e) {
        // If category not found, ignore
      }
    }

    try {
      await _apiService.post('/transactions', {
        'session_id': sessionId,
        'type': type,
        'amount': amount,
        if (categoryName != null) 'category': categoryName, // Send Name to match Web App
        if (categoryId != null) 'category_id': categoryId, // Send ID as well
        if (fromWalletId != null) 'from_wallet_id': fromWalletId,
        if (toWalletId != null) 'to_wallet_id': toWalletId,
        if (description != null) 'description': description,
      });
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
