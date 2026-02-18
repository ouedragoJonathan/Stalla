import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../data/repositories/stand_repository.dart';

class StandListScreen extends StatefulWidget {
  const StandListScreen({super.key});

  @override
  State<StandListScreen> createState() => _StandListScreenState();
}

class _StandListScreenState extends State<StandListScreen> {
  final _repository = StandRepository();
  List<StandZoneOverview> _zones = [];
  bool _loading = true;
  String? _error;
  int? _expandedIndex;

  @override
  void initState() {
    super.initState();
    _loadStands();
  }

  Future<void> _loadStands() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final response = await _repository.getPublicStandsOverview();
    setState(() {
      _loading = false;
      if (response.success) {
        _zones = response.data!;
      } else {
        _error = response.message;
      }
    });
  }

  void _requestStand(String zone, String category) {
    context.push(
      '/register',
      extra: {'zone': zone, 'category': category},
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      appBar: AppBar(
        title: Text(
          'Stands Disponibles',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: _loadStands,
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              : _zones.isEmpty
                  ? Center(
                      child: Text(
                        'Aucun stand disponible pour le moment.',
                        style: GoogleFonts.poppins(color: Colors.grey),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _zones.length,
                      itemBuilder: (context, index) {
                        final zone = _zones[index];
                        final isExpanded = _expandedIndex == index;
                        return _ZoneCard(
                          zone: zone,
                          isExpanded: isExpanded,
                          onTap: () {
                            setState(() {
                              _expandedIndex = isExpanded ? null : index;
                            });
                          },
                          onRequest: _requestStand,
                        );
                      },
                    ),
    );
  }
}

class _ZoneCard extends StatelessWidget {
  final StandZoneOverview zone;
  final bool isExpanded;
  final VoidCallback onTap;
  final void Function(String zone, String category) onRequest;

  const _ZoneCard({
    required this.zone,
    required this.isExpanded,
    required this.onTap,
    required this.onRequest,
  });

  String _formatPrice(int min, int max) =>
      '${_fmt(max)} CFA';

  String _fmt(int value) => value.toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]} ',
      );

  String _getZoneLabel(String zone) {
    const labels = {
      'A': 'Zone A - Entrée',
      'B': 'Zone B - Produits frais',
      'C': 'Zone C - Textile',
      'D': 'Zone D - Divers',
    };
    return labels[zone] ?? 'Zone $zone';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Zone header
          InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF6B2C).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        zone.zone.substring(0, 1).toUpperCase(),
                        style: GoogleFonts.poppins(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFFFF6B2C),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _getZoneLabel(zone.zone),
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          '${zone.standardAvailable + zone.premiumAvailable} stand(s) disponible(s)',
                          style: GoogleFonts.poppins(
                            color: Colors.grey[600],
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    isExpanded ? Icons.expand_less : Icons.expand_more,
                    color: Colors.grey,
                  ),
                ],
              ),
            ),
          ),

          // Expanded content
          if (isExpanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                children: [
                  const Divider(),
                  const SizedBox(height: 8),
                  // Standard
                  _CategoryRow(
                    label: 'Standard',
                    available: zone.standardAvailable,
                    priceRange: _formatPrice(
                        zone.standardPriceMin, zone.standardPriceMax),
                    color: const Color(0xFF4CAF50),
                    onRequest: zone.standardAvailable > 0
                        ? () => onRequest(zone.zone, 'STANDARD')
                        : null,
                  ),
                  const SizedBox(height: 10),
                  // Premium
                  _CategoryRow(
                    label: 'Premium',
                    available: zone.premiumAvailable,
                    priceRange: _formatPrice(
                        zone.premiumPriceMin, zone.premiumPriceMax),
                    color: const Color(0xFFFF6B2C),
                    onRequest: zone.premiumAvailable > 0
                        ? () => onRequest(zone.zone, 'PREMIUM')
                        : null,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _CategoryRow extends StatelessWidget {
  final String label;
  final int available;
  final String priceRange;
  final Color color;
  final VoidCallback? onRequest;

  const _CategoryRow({
    required this.label,
    required this.available,
    required this.priceRange,
    required this.color,
    this.onRequest,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              label,
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$available disponible(s)',
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
                Text(
                  priceRange,
                  style: GoogleFonts.poppins(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          if (onRequest != null)
            TextButton(
              onPressed: onRequest,
              style: TextButton.styleFrom(
                foregroundColor: color,
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              ),
              child: Text(
                'Demander',
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            )
          else
            Text(
              'Complet',
              style: GoogleFonts.poppins(
                color: Colors.grey,
                fontSize: 12,
              ),
            ),
        ],
      ),
    );
  }
}
