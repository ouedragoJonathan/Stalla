import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../providers/vendor_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;
  
  // Variable pour basculer entre Email et Téléphone
  bool _isEmailLogin = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // Helpers pour le design dynamique et l'UX
  String get _labelText => _isEmailLogin ? 'Adresse email' : 'Numéro de téléphone';
  String get _hintText => _isEmailLogin ? 'vendeur@example.com' : '07 00 00 00';
  TextInputType get _keyboardType => _isEmailLogin ? TextInputType.emailAddress : TextInputType.phone;
  IconData get _prefixIcon => _isEmailLogin ? Icons.email_outlined : Icons.phone_android_outlined;

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final identifier = _emailController.text.trim();

    final success = await authProvider.login(
      identifier,
      _passwordController.text,
    );

    if (!mounted) return;

    if (success) {
      final vendorProvider = context.read<VendorProvider>();
      
      // Chargement des données métier avant d'entrer dans l'app
      await Future.wait([
        vendorProvider.fetchProfile(),
        vendorProvider.fetchDebts(),
      ]);

      if (!mounted) return;
      context.go(AppConstants.homeRoute);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Erreur de connexion'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Align(
                    alignment: Alignment.topLeft,
                    child: InkWell(
                      onTap: () => context.go('/landing'),
                      borderRadius: BorderRadius.circular(50),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.arrow_back_ios_new_rounded,
                          size: 20,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // --- 1. LOGO CENTRÉ ---
                  Center(
                    child: Container(
                      height: 100,
                      width: 100,
                      margin: const EdgeInsets.only(bottom: 24),
                      child: Image.asset(
                        'assets/logo/logo.png',
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) => const Icon(
                          Icons.store_rounded,
                          size: 80,
                          color: AppColors.orangePantone,
                        ),
                      ),
                    ),
                  ),

                  // --- 2. TEXTES DE BIENVENUE ---
                  Text(
                    'Connexion',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Accédez à votre espace vendeur',
                    style: TextStyle(color: Colors.grey[600], fontSize: 16),
                  ),
                  const SizedBox(height: 32),

                  // --- 3. SÉLECTEUR D'ONGLET (TOGGLE) ---
                  Container(
                    height: 55,
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        _buildTabItem(
                          title: 'Email', 
                          isActive: _isEmailLogin, 
                          onTap: () => setState(() => _isEmailLogin = true)
                        ),
                        _buildTabItem(
                          title: 'Téléphone', 
                          isActive: !_isEmailLogin, 
                          onTap: () => setState(() => _isEmailLogin = false)
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // --- 4. CHAMP IDENTIFIANT (DYNAMIQUE) ---
                  Text(
                    _labelText,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: _keyboardType,
                    decoration: InputDecoration(
                      hintText: _hintText,
                      prefixIcon: Icon(_prefixIcon, size: 20),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Ce champ est requis';
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),

                  // --- 5. CHAMP MOT DE PASSE ---
                  const Text(
                    'Mot de passe',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: !_isPasswordVisible,
                    decoration: InputDecoration(
                      hintText: '••••••••',
                      prefixIcon: const Icon(Icons.lock_outline, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(_isPasswordVisible ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                        onPressed: () => setState(() => _isPasswordVisible = !_isPasswordVisible),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Entrez votre mot de passe';
                      return null;
                    },
                  ),
                  
                  const SizedBox(height: 40),

                  // --- 6. BOUTON DE CONNEXION ---
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, _) {
                      final isLoading = authProvider.status == AuthStatus.loading;
                      return SizedBox(
                        width: double.infinity,
                        height: 55,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.orangePantone,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 0,
                          ),
                          child: isLoading
                              ? const SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : const Text(
                                  'Se connecter',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // Widget personnalisé pour l'onglet du sélecteur
  Widget _buildTabItem({required String title, required bool isActive, required VoidCallback onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            boxShadow: isActive 
              // ignore: deprecated_member_use
              ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))]
              : [],
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              color: isActive ? AppColors.orangePantone : Colors.grey[500],
              fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
              fontSize: 15,
            ),
          ),
        ),
      ),
    );
  }
}