# STALLA Mobile - Application Vendeur

Application mobile Flutter pour la gestion des stands de marché STALLA.

## 🚀 Fonctionnalités

- ✅ Authentification vendeur
- ✅ Tableau de bord avec informations du stand
- ✅ Consultation des dettes
- ✅ Historique des paiements
- ✅ Gestion du profil

## 📋 Prérequis

- Flutter SDK 3.0+
- Dart 3.0+
- Docker & Docker Compose (pour le déploiement)

## 🛠️ Installation

### Locale

```bash
# Cloner le projet
git clone <url-du-repo>

# Installer les dépendances
flutter pub get

# Lancer l'app
flutter run
```

### Avec Docker

```bash
# Construire et lancer le conteneur
docker-compose up --build

# Accès web: http://localhost:8080
```

## 🎨 Structure du Projet

```
lib/
├── config/          # Configuration (router)
├── core/
│   ├── constants/   # Constantes globales
│   ├── theme/       # Thème et couleurs
│   └── utils/       # Utilitaires
├── data/
│   ├── models/      # Modèles de données
│   ├── repositories/# Repositories
│   └── services/    # Services (API, Storage)
└── presentation/
    ├── providers/   # State management
    ├── screens/     # Écrans de l'app
    └── widgets/     # Widgets réutilisables
```

## 🔌 API Backend

URL de base: `http://localhost:4000/api/v1`

Voir le fichier `SPÉCIFICATIONS_DÉTAILLÉES_DES_ROUTES_API.pdf` pour la documentation complète.

## 🎨 Palette de Couleurs

- Light Yellow: `#FFFBDC`
- Light Orange: `#FFD3A5`
- Sandy Brown: `#FFAA6E`
- Pumpkin: `#FF8237`
- Orange Pantone: `#FF5900`

## 📱 Écrans Disponibles

1. **Login** - Connexion vendeur
2. **Home** - Dashboard principal
3. **Stand** - Détails du stand
4. **Dettes** - Liste des impayés
5. **Paiements** - Historique des paiements
6. **Profil** - Informations personnelles

## 🔐 Authentification

L'app utilise JWT tokens stockés de manière sécurisée via `flutter_secure_storage`.

## 📦 Dépendances Principales

- `provider` - State management
- `go_router` - Navigation
- `dio` - Client HTTP
- `google_fonts` - Typographie
- `shared_preferences` - Storage local
- `flutter_secure_storage` - Storage sécurisé

## 🚧 Développement

```bash
# Lancer en mode debug
flutter run

# Build APK
flutter build apk --release

# Build pour iOS
flutter build ios --release
```

## 📝 Licence

© 2026 STALLA. Tous droits réservés.