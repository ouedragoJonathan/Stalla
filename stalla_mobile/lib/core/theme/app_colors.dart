import 'package:flutter/material.dart';
import '../constants/app_constants.dart';

class AppColors {
  static const bool _useEarthPalette = AppConstants.colorPalette == 'earth';

  // Palette principale (switchable)
  static const Color lightYellow = _useEarthPalette ? Color(0xFFF7EBD3) : Color(0xFFFFFBDC);
  static const Color lightOrange = _useEarthPalette ? Color(0xFFFFDBAF) : Color(0xFFFFD3A5);
  static const Color sandyBrown = _useEarthPalette ? Color(0xFFCA7B42) : Color(0xFFFFAA6E);
  static const Color pumpkin = _useEarthPalette ? Color(0xFF823919) : Color(0xFFFF8237);
  static const Color orangePantone = _useEarthPalette ? Color(0xFF521908) : Color(0xFFFF5900);

  // Couleurs de texte
  static const Color textDark = _useEarthPalette ? Color(0xFF521908) : Color(0xFF2D2D2D);
  static const Color textMuted = _useEarthPalette ? Color(0xFF823919) : Color(0xFF666666);
  static const Color white = Color(0xFFFFFFFF);

  // Couleurs système
  static const Color error = Color(0xFFEF4444);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);

  // Backgrounds
  static const Color background = _useEarthPalette ? Color(0xFFF7EBD3) : Color(0xFFF4F4F4);
  static const Color cardBackground = _useEarthPalette ? Color(0xFFFFF8EF) : Color(0xFFFFFFFF);
}
