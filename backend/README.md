# STALLA Backend

API REST de gestion de stands pour marchés (admin + vendeurs).

## Prérequis

- Node.js 18+
- MySQL 8+ (si exécution hors Docker)

## Configuration

Créer/adapter `backend/.env` :

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stalla
DB_USER=root
DB_PASSWORD=
JWT_SECRET=une_cle_secrete_longue_et_complexe
JWT_EXPIRES_IN=7d

# Email Brevo
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=STALLA
WEB_BASE_URL=http://localhost:5173
```

## Lancer en local

```bash
cd backend
npm install
npm run dev
```

Health check: `http://localhost:4000/health`

## Lancer avec Docker

Depuis la racine du repo (`/home/carine/Stalla`):

```bash
docker compose -f docker-compose.backend.yml up -d --build
```

Services:
- API: `http://localhost:4000`
- MySQL: `localhost:3307`

Arrêter:

```bash
docker compose -f docker-compose.backend.yml down
```

Supprimer aussi les volumes:

```bash
docker compose -f docker-compose.backend.yml down -v
```

## Documentation API

- Swagger UI: `http://localhost:4000/api-docs`
- Détails API: `docs/DOCUMENTATION_API.md`
- Guide Postman: `docs/GUIDE_POSTMAN.md`
