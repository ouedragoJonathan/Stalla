import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class CustomCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Color? backgroundColor;
  final Gradient? gradient;
  final VoidCallback? onTap;

  const CustomCard({
    super.key,
    required this.child,
    this.padding,
    this.backgroundColor,
    this.gradient,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        padding: padding ?? const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: gradient == null ? (backgroundColor ?? AppColors.cardBackground) : null,
          gradient: gradient,
          borderRadius: BorderRadius.circular(20),
          border: gradient == null
              ? Border.all(
                  color: AppColors.sandyBrown.withValues(alpha: 0.2),
                  width: 1,
                )
              : null,
          boxShadow: [
            BoxShadow(
              color: AppColors.pumpkin.withValues(alpha: 0.05),
              blurRadius: 15,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: child,
      ),
    );
  }
}
