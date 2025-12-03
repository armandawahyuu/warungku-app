import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../models/user_model.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  User? _user;
  bool _isLoading = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  Future<void> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.post('/auth/login', {
        'username': username,
        'password': password,
      });

      final token = response['token'];
      final userData = response['user'];

      _user = User.fromJson(userData);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      await prefs.setString('user', userData.toString()); // Simplified storage

      notifyListeners();
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('token')) return;

    // In a real app, you might validate the token with the backend here
    // For now, we just check if it exists. 
    // Ideally, we should store user data properly or fetch it again.
    // Since we didn't implement /auth/me, we'll just require login for now if data is missing.
    // Or we can decode the token if it's JWT.
    
    // For simplicity in this MVP, let's just clear if no user data is stored properly
    // or implement a simple check.
  }
}
