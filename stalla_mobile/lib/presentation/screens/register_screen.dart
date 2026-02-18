import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../data/repositories/stand_repository.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  final String? initialZone;
  final String? initialCategory;

  const RegisterScreen({
    super.key,
    this.initialZone,
    this.initialCategory,
  });

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _businessTypeController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();

  int _currentStep = 0;
  bool _isLoadingZones = true;

  // Stand info
  static const Map<String, String> _zoneLabels = {
    'A': 'Zone A - Entrée',
    'B': 'Zone B - Produits frais',
    'C': 'Zone C - Textile',
    'D': 'Zone D - Divers',
  };
  
  List<StandZoneOverview> _zones = [];
  String? _selectedZone;
  String _selectedCategory = 'STANDARD';

  final _standRepository = StandRepository();

  @override
  void initState() {
    super.initState();
    _selectedZone = widget.initialZone;
    _selectedCategory = widget.initialCategory ?? 'STANDARD';
    _loadZones();
  }

  Future<void> _loadZones() async {
    final response = await _standRepository.getPublicStandsOverview();
    if (mounted) {
      setState(() {
        _isLoadingZones = false;
        if (response.success) {
          _zones = response.data!;
          // If no initial zone, default to first available
          if (_selectedZone == null && _zones.isNotEmpty) {
            _selectedZone = _zones.first.zone;
          }
        }
      });
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _businessTypeController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  StandZoneOverview? get _selectedZoneData {
    if (_selectedZone == null) return null;
    try {
      return _zones.firstWhere((z) => z.zone == _selectedZone);
    } catch (_) {
      return null;
    }
  }

  String _getPriceRange() {
    final z = _selectedZoneData;
    if (z == null) return '';
    if (_selectedCategory == 'PREMIUM') {
      return '${_fmt(z.premiumPriceMax)} CFA';
    }
    return '${_fmt(z.standardPriceMax)} CFA';
  }

  String _fmt(int value) => value.toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]} ',
      );

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

    // Budget based on category selection
    final zoneData = _selectedZoneData;
    final budgetMin = _selectedCategory == 'PREMIUM'
        ? (zoneData?.premiumPriceMin ?? 35000).toDouble()
        : (zoneData?.standardPriceMin ?? 10000).toDouble();
    final budgetMax = _selectedCategory == 'PREMIUM'
        ? (zoneData?.premiumPriceMax ?? 50000).toDouble()
        : (zoneData?.standardPriceMax ?? 30000).toDouble();

    final success = await context.read<AuthProvider>().submitVendorApplication(
          fullName: _fullNameController.text.trim(),
          businessType: _businessTypeController.text.trim(),
          phone: _phoneController.text.trim(),
          email: _emailController.text.trim().isEmpty
              ? null
              : _emailController.text.trim(),
          desiredZone: _selectedZone!,
          desiredCategory: _selectedCategory,
          budgetMin: budgetMin,
          budgetMax: budgetMax,
        );

    if (!mounted) return;

    if (success) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          title: const Text('Demande envoyée !'),
          content: const Text(
            'Votre demande a été envoyée avec succès.\n'
            "L'admin la validera bientôt. Vous recevrez un email avec vos identifiants si votre demande est approuvée.",
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.go(AppConstants.loginRoute);
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
      return;
    }

    final error =
        context.read<AuthProvider>().errorMessage ?? "Erreur lors de l'envoi";
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(error), backgroundColor: AppColors.error),
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

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel('Nom complet *'),
        TextFormField(
          controller: _fullNameController,
          decoration: const InputDecoration(hintText: 'Ex: Jonathan Ouedraogo'),
          validator: (v) =>
              (v == null || v.trim().isEmpty) ? 'Champ requis' : null,
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
        _buildLabel('Téléphone *'),
        TextFormField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration:
              const InputDecoration(hintText: 'Ex: +226 70 00 00 00'),
          validator: (v) =>
              (v == null || v.trim().isEmpty) ? 'Champ requis' : null,
        ),
        const SizedBox(height: 16),
        _buildLabel('Activité *'),
        TextFormField(
          controller: _businessTypeController,
          decoration:
              const InputDecoration(hintText: 'Ex: Vente de légumes'),
          validator: (v) =>
              (v == null || v.trim().isEmpty) ? 'Champ requis' : null,
        ),
      ],
    );
  }

  Widget _buildStep2() {
    if (_isLoadingZones) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel('Zone souhaitée *'),
        DropdownButtonFormField<String>(
          value: _selectedZone,
          decoration: const InputDecoration(hintText: 'Choisir une zone'),
          items: _zoneLabels.entries
              .map((e) => DropdownMenuItem<String>(
                    value: e.key,
                    child: Text(e.value),
                  ))
              .toList(),
          onChanged: widget.initialZone != null ? null : (v) => setState(() => _selectedZone = v),
          validator: (v) => v == null ? 'Requis' : null,
        ),
        const SizedBox(height: 16),
        _buildLabel('Catégorie *'),
        DropdownButtonFormField<String>(
          value: _selectedCategory,
          decoration: const InputDecoration(hintText: 'Choisir une catégorie'),
          items: const [
            DropdownMenuItem(
              value: 'STANDARD',
              child: Text('Standard'),
            ),
            DropdownMenuItem(
              value: 'PREMIUM',
              child: Text('Premium'),
            ),
          ],
          onChanged: widget.initialCategory != null ? null : (v) => setState(() => _selectedCategory = v ?? 'STANDARD'),
        ),
        if (_selectedZone != null && _selectedZoneData != null) ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.orangePantone.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                  color: AppColors.orangePantone.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline,
                    color: AppColors.orangePantone, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Prix du stand : ${_getPriceRange()}',
                    style: const TextStyle(
                      color: AppColors.orangePantone,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => context.go('/landing'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: SizedBox(
                    height: 72,
                    width: 72,
                    child: Image.asset(
                      'assets/logo/logo.png',
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) => const Icon(
                        Icons.store_rounded,
                        size: 60,
                        color: AppColors.orangePantone,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Demande de stand',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  "Renseignez vos informations. L'admin validera votre demande.",
                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                ),
                const SizedBox(height: 24),

                // Step indicator
                Row(
                  children: [
                    _StepIndicator(
                        number: 1,
                        label: 'Infos perso.',
                        isActive: _currentStep == 0,
                        isDone: _currentStep > 0),
                    Expanded(
                      child: Container(
                        height: 2,
                        color: _currentStep > 0
                            ? AppColors.orangePantone
                            : Colors.grey[300],
                      ),
                    ),
                    _StepIndicator(
                        number: 2,
                        label: 'Infos stand',
                        isActive: _currentStep == 1,
                        isDone: false),
                  ],
                ),

                const SizedBox(height: 28),

                // Step content
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: _currentStep == 0
                      ? _buildStep1()
                      : _buildStep2(),
                ),

                const SizedBox(height: 28),

                // Navigation buttons
                Consumer<AuthProvider>(
                  builder: (context, authProvider, _) {
                    final isLoading =
                        authProvider.status == AuthStatus.loading;
                    return Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          height: 54,
                          child: ElevatedButton(
                            onPressed: isLoading
                                ? null
                                : () {
                                    if (_currentStep == 0) {
                                      // Validate step 1 fields
                                      if (_fullNameController.text.trim().isEmpty ||
                                          _phoneController.text.trim().isEmpty ||
                                          _businessTypeController.text
                                              .trim()
                                              .isEmpty) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          const SnackBar(
                                            content: Text(
                                                'Veuillez remplir tous les champs obligatoires'),
                                            backgroundColor: AppColors.error,
                                          ),
                                        );
                                        return;
                                      }
                                      setState(() => _currentStep = 1);
                                    } else {
                                      _handleSubmit();
                                    }
                                  },
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
                                : Text(
                                    _currentStep == 0
                                        ? 'Suivant'
                                        : 'Envoyer ma demande',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                          ),
                        ),
                        if (_currentStep == 1) ...[
                          const SizedBox(height: 8),
                          TextButton(
                            onPressed: () => setState(() => _currentStep = 0),
                            child: const Text('Retour'),
                          ),
                        ],
                        const SizedBox(height: 8),
                        Center(
                          child: TextButton(
                            onPressed: () =>
                                context.go(AppConstants.loginRoute),
                            child: RichText(
                              text: const TextSpan(
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                                children: [
                                  TextSpan(
                                    text: 'Déjà un compte ? ',
                                    style: TextStyle(color: Colors.black87),
                                  ),
                                  TextSpan(
                                    text: 'Se connecter',
                                    style: TextStyle(
                                        color: AppColors.orangePantone),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
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
}

class _StepIndicator extends StatelessWidget {
  final int number;
  final String label;
  final bool isActive;
  final bool isDone;

  const _StepIndicator({
    required this.number,
    required this.label,
    required this.isActive,
    required this.isDone,
  });

  @override
  Widget build(BuildContext context) {
    final color = (isActive || isDone)
        ? AppColors.orangePantone
        : Colors.grey[400]!;
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: (isActive || isDone) ? AppColors.orangePantone : Colors.grey[200],
            shape: BoxShape.circle,
          ),
          child: Center(
            child: isDone
                ? const Icon(Icons.check, color: Colors.white, size: 16)
                : Text(
                    '$number',
                    style: TextStyle(
                      color: isActive ? Colors.white : Colors.grey[600],
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: color,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
