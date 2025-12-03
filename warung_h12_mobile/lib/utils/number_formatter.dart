import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

/// Text input formatter that adds thousand separators (dots) to numbers
/// Example: 1000000 -> 1.000.000
class ThousandsSeparatorInputFormatter extends TextInputFormatter {
  final NumberFormat _formatter = NumberFormat('#,###', 'id_ID');

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue;
    }

    // Remove all non-digit characters
    String digitsOnly = newValue.text.replaceAll(RegExp(r'[^\d]'), '');
    
    if (digitsOnly.isEmpty) {
      return const TextEditingValue();
    }

    // Parse and format with thousand separators
    final number = int.tryParse(digitsOnly);
    if (number == null) {
      return oldValue;
    }

    final formatted = _formatter.format(number);

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

/// Helper function to parse formatted number string back to double
/// Example: "1.000.000" -> 1000000.0
double parseFormattedNumber(String formattedNumber) {
  if (formattedNumber.isEmpty) return 0.0;
  
  // Remove thousand separators (dots and commas)
  String digitsOnly = formattedNumber.replaceAll(RegExp(r'[.,]'), '');
  
  return double.tryParse(digitsOnly) ?? 0.0;
}

/// Helper function to format number for display
/// Example: 1000000 -> "1.000.000"
String formatNumber(num number) {
  final formatter = NumberFormat('#,###', 'id_ID');
  return formatter.format(number);
}
