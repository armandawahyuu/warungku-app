import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'exceptions.dart';

class ApiService {
  // Timeout and retry configuration
  static const Duration _timeout = Duration(seconds: 30);
  static const int _maxRetries = 3;
  static const Duration _initialRetryDelay = Duration(seconds: 2);

  // Use Render (Cloud) for Release (APK), Localhost for Web Debug, and LAN IP for Mobile Debug
  static String get _baseUrl {
    if (kReleaseMode) {
      return 'https://warungku-api.onrender.com/api';
    }
    if (kIsWeb) {
      return 'http://localhost:5001/api';
    }
    // Use Render (Cloud) for Mobile Debug as well to verify deployment
    return 'https://warungku-api.onrender.com/api';
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Check network connectivity before making requests
  Future<bool> _checkConnectivity() async {
    try {
      final connectivityResult = await Connectivity().checkConnectivity();
      return connectivityResult.first != ConnectivityResult.none;
    } catch (e) {
      // If connectivity check fails, assume we have connection and let the request fail naturally
      if (kDebugMode) {
        print('Connectivity check failed: $e');
      }
      return true;
    }
  }

  /// Retry logic with exponential backoff
  Future<T> _retryRequest<T>(Future<T> Function() request) async {
    for (int attempt = 0; attempt < _maxRetries; attempt++) {
      try {
        return await request();
      } catch (e) {
        // Don't retry on auth errors (401)
        if (e is ServerException && e.statusCode == 401) {
          rethrow;
        }

        // Don't retry on client errors (400-499 except 401, 408, 429)
        if (e is ServerException &&
            e.statusCode >= 400 &&
            e.statusCode < 500 &&
            e.statusCode != 408 &&
            e.statusCode != 429) {
          rethrow;
        }

        // On last attempt, rethrow the error
        if (attempt == _maxRetries - 1) {
          rethrow;
        }

        // Exponential backoff: 2s, 4s, 8s
        final delay = _initialRetryDelay * (1 << attempt);
        if (kDebugMode) {
          print('Request failed (attempt ${attempt + 1}/$_maxRetries). Retrying in ${delay.inSeconds}s...');
        }
        await Future.delayed(delay);
      }
    }
    throw Exception('Max retries exceeded');
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    // Check connectivity first
    if (!await _checkConnectivity()) {
      throw NetworkException();
    }

    return _retryRequest(() async {
      try {
        final response = await http
            .post(
              Uri.parse('$_baseUrl$endpoint'),
              headers: await _getHeaders(),
              body: jsonEncode(body),
            )
            .timeout(_timeout);

        return _handleResponse(response);
      } on SocketException {
        throw NetworkException('Failed to connect to server. Please check your internet connection.');
      } on TimeoutException {
        throw TimeoutException();
      } on http.ClientException catch (e) {
        if (e.message.contains('Failed host lookup')) {
          throw NetworkException('Cannot reach server. Please check your DNS settings or internet connection.');
        }
        throw NetworkException('Network error: ${e.message}');
      }
    });
  }

  Future<dynamic> get(String endpoint) async {
    // Check connectivity first
    if (!await _checkConnectivity()) {
      throw NetworkException();
    }

    return _retryRequest(() async {
      try {
        final response = await http
            .get(
              Uri.parse('$_baseUrl$endpoint'),
              headers: await _getHeaders(),
            )
            .timeout(_timeout);

        return _handleResponse(response);
      } on SocketException {
        throw NetworkException('Failed to connect to server. Please check your internet connection.');
      } on TimeoutException {
        throw TimeoutException();
      } on http.ClientException catch (e) {
        if (e.message.contains('Failed host lookup')) {
          throw NetworkException('Cannot reach server. Please check your DNS settings or internet connection.');
        }
        throw NetworkException('Network error: ${e.message}');
      }
    });
  }

  Future<dynamic> delete(String endpoint) async {
    // Check connectivity first
    if (!await _checkConnectivity()) {
      throw NetworkException();
    }

    return _retryRequest(() async {
      try {
        final response = await http
            .delete(
              Uri.parse('$_baseUrl$endpoint'),
              headers: await _getHeaders(),
            )
            .timeout(_timeout);

        return _handleResponse(response);
      } on SocketException {
        throw NetworkException('Failed to connect to server. Please check your internet connection.');
      } on TimeoutException {
        throw TimeoutException();
      } on http.ClientException catch (e) {
        if (e.message.contains('Failed host lookup')) {
          throw NetworkException('Cannot reach server. Please check your DNS settings or internet connection.');
        }
        throw NetworkException('Network error: ${e.message}');
      }
    });
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw AuthException('Invalid credentials or session expired');
    } else if (response.statusCode >= 400 && response.statusCode < 500) {
      // Client errors
      String message = 'Request failed';
      try {
        final body = jsonDecode(response.body);
        message = body['message'] ?? body['error'] ?? message;
      } catch (e) {
        message = response.body.isNotEmpty ? response.body : message;
      }
      throw ServerException(response.statusCode, message);
    } else {
      // Server errors (500+)
      throw ServerException(
        response.statusCode,
        'Server error occurred. Please try again later.',
      );
    }
  }
}

