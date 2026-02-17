import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _budgetMinController = TextEditingController();
  final _budgetMaxController = TextEditingController();

  final List<String> _zones = const [
    'Zone A - Entrée principale',
    'Zone B - Produits frais',
    'Zone C - Textile',
    'Zone D - Divers',
  ];
  String? _selectedZone;

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _budgetMinController.dispose();
    _budgetMaxController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedZone == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez choisir une zone souhaitée'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final budgetMin = double.tryParse(_budgetMinController.text.trim()) ?? 0;
    final budgetMax = double.tryParse(_budgetMaxController.text.trim()) ?? 0;
    if (budgetMin <= 0 || budgetMax <= 0 || budgetMin > budgetMax) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Marge de prix invalide (min <= max)'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final success = await context.read<AuthProvider>().submitVendorApplication(
          fullName: _fullNameController.text.trim(),
          phone: _phoneController.text.trim(),
          email: _emailController.text.trim(),
          desiredZone: _selectedZone!,
          budgetMin: budgetMin,
          budgetMax: budgetMax,
        );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Demande envoyée. L\'admin la validera bientôt.'),
          backgroundColor: Colors.green,
        ),
      );
      context.go(AppConstants.loginRoute);
      return;
    }

    final error =
        context.read<AuthProvider>().errorMessage ?? 'Erreur lors de l\'envoi';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(error), backgroundColor: AppColors.error),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black87,
        title: const Text('Demande de stand'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Inscription vendeur',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Renseignez vos informations. L\'admin validera votre demande.',
                  style: TextStyle(color: Colors.grey[600], fontSize: 15),
                ),
                const SizedBox(height: 24),
                _buildLabel('Nom complet'),
                TextFormField(
                  controller: _fullNameController,
                  decoration: const InputDecoration(hintText: 'Ex: Awa Kossi'),
                  validator: (value) => (value == null || value.trim().isEmpty)
                      ? 'Champ requis'
                      : null,
                ),
                const SizedBox(height: 16),
                _buildLabel('Téléphone'),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration:
                      const InputDecoration(hintText: 'Ex: +229XXXXXXXX'),
                  validator: (value) => (value == null || value.trim().isEmpty)
                      ? 'Champ requis'
                      : null,
                ),
                const SizedBox(height: 16),
                _buildLabel('Email (optionnel)'),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration:
                      const InputDecoration(hintText: 'vendeur@example.com'),
                ),
                const SizedBox(height: 16),
                _buildLabel('Zone souhaitée'),
                DropdownButtonFormField<String>(
                  value: _selectedZone,
                  decoration:
                      const InputDecoration(hintText: 'Choisir une zone'),
                  items: _zones
                      .map((zone) => DropdownMenuItem<String>(
                          value: zone, child: Text(zone)))
                      .toList(),
                  onChanged: (value) => setState(() => _selectedZone = value),
                ),
                const SizedBox(height: 16),
                _buildLabel('Marge de prix mensuelle'),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _budgetMinController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(hintText: 'Min'),
                        validator: (value) =>
                            (value == null || value.trim().isEmpty)
                                ? 'Requis'
                                : null,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _budgetMaxController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(hintText: 'Max'),
                        validator: (value) =>
                            (value == null || value.trim().isEmpty)
                                ? 'Requis'
                                : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                Consumer<AuthProvider>(
                  builder: (context, authProvider, _) {
                    final isLoading = authProvider.status == AuthStatus.loading;
                    return SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.orangePantone,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        child: isLoading
                            ? const SizedBox(
                                height: 22,
                                width: 22,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2),
                              )
                            : const Text(
                                'Envoyer ma demande',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
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
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
    );
  }
}
