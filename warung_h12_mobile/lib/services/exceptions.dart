/// Custom exception classes for better error handling in the mobile app
library;

class NetworkException implements Exception {
  final String message;
  NetworkException([
    this.message = 'No internet connection. Please check your network.',
  ]);

  @override
  String toString() => message;
}

class TimeoutException implements Exception {
  final String message;
  TimeoutException([this.message = 'Request timeout. Please try again.']);

  @override
  String toString() => message;
}

class ServerException implements Exception {
  final int statusCode;
  final String message;

  ServerException(this.statusCode, [this.message = 'Server error occurred']);

  @override
  String toString() => 'Server Error ($statusCode): $message';
}

class AuthException implements Exception {
  final String message;
  AuthException([this.message = 'Authentication failed']);

  @override
  String toString() => message;
}
