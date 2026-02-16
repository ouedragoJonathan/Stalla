# STALLA - Plateforme Marché (Web Admin + Mobile Vendeur + Backend API)

STALLA est une solution complète de gestion de marché:
- `stalla_web`: interface **Admin** (React + Vite + TypeScript)
- `stalla_mobile`: application **Vendeur** (Flutter)
- `backend`: API REST + logique métier (Node.js + Express + MySQL)

## Architecture

- Backend API: `http://localhost:4000`
- Base API: `http://localhost:4000/api`
- Web Admin (dev): `http://localhost:5173`
- Mobile Vendeur: Flutter (Android/iOS)

Le backend expose notamment:
- routes admin: `/api/admin/*`
- routes auth: `/api/auth/*`
- routes vendeur: `/api/vendor/*`
- alias de compatibilité vendeur: `/api/v1/vendor/*`

## Structure du repo

```text
Stalla/
├── backend/
├── stalla_web/
├── stalla_mobile/
├── docs/
└── docker-compose.backend.yml
```

## Prérequis

- Node.js 18+
- npm
- Flutter SDK 3+
- Android SDK (pour APK)
- Docker + Docker Compose (optionnel mais recommandé pour backend)

## 1) Lancer le backend

### Option A - Docker (recommandé)

Depuis la racine du projet:

```bash
docker compose -f docker-compose.backend.yml up -d --build
```

Vérifier:

```bash
docker compose -f docker-compose.backend.yml ps
curl http://localhost:4000/health
```

Arrêter:

```bash
docker compose -f docker-compose.backend.yml down
```

Réinitialiser DB + volumes:

```bash
docker compose -f docker-compose.backend.yml down -v
```

### Option B - Local (sans Docker)

```bash
cd backend
npm install
npm run dev
```

## 2) Configuration backend (`backend/.env`)

Exemple minimum:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stalla
DB_USER=root
DB_PASSWORD=
JWT_SECRET=une_cle_secrete_longue_et_complexe
JWT_EXPIRES_IN=7d

# Email (reset password / notifications)
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=STALLA

# URL publique du front web (important pour les liens email)
WEB_BASE_URL=http://localhost:5173
```

## 3) Lancer le Web Admin

```bash
cd stalla_web
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

Variable optionnelle:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## 4) Lancer le Mobile Vendeur

```bash
cd stalla_mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://<IP_BACKEND>:4000/api
```

Note:
- `API_BASE_URL` est configurable via `--dart-define`.
- Si non fourni, l'app utilise la valeur par défaut définie dans `app_constants.dart`.

## 5) Build APK (Android)

```bash
cd stalla_mobile
flutter clean
flutter pub get
flutter build apk --release --dart-define=API_BASE_URL=http://<IP_BACKEND>:4000/api
```

APK généré:

```text
stalla_mobile/build/app/outputs/flutter-apk/app-release.apk
```

Installer sur téléphone:

```bash
adb install -r stalla_mobile/build/app/outputs/flutter-apk/app-release.apk
```

## 6) Déploiement backend (production)

Minimum recommandé:
- un VPS Linux (Ubuntu)
- Docker
- base MySQL managée ou conteneur MySQL dédié
- nom de domaine + reverse proxy (Nginx/Caddy)
- HTTPS (Let's Encrypt)

Checklist prod:
- `JWT_SECRET` fort
- `WEB_BASE_URL` en URL publique HTTPS
- variables Brevo valides
- ports et firewall configurés
- sauvegarde base MySQL

## 7) Git workflow conseillé

```bash
# depuis ta branche de travail
git add .
git commit -m "feat: finalisation stalla web/mobile/backend"
git push origin <ta-branche>

# merge vers main
git checkout main
git pull origin main
git merge --no-ff <ta-branche>
git push origin main
```

## 8) Troubleshooting rapide

- `Token manquant ou invalide`:
  - vérifier Authorization header
  - vérifier expiration JWT
  - vérifier que mobile/web pointent vers le bon backend

- `Erreur serveur lors de la connexion`:
  - vérifier que backend + DB tournent
  - consulter logs: `docker compose -f docker-compose.backend.yml logs -f backend`

- Lien reset password invalide sur téléphone:
  - vérifier `WEB_BASE_URL` (pas `localhost` pour appareil externe)
  - utiliser une URL accessible depuis le téléphone

## 9) Documentation complémentaire

- Backend: `backend/README.md`
- Web Admin: `stalla_web/README.md`
- Mobile: `stalla_mobile/README.md`
- API docs: `http://localhost:4000/api-docs`
