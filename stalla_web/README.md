# STALLA Web Admin (Base)

## Démarrage

```bash
cd stalla_web
npm install
npm run dev
```

## Configuration API

Par défaut, l'app appelle `http://localhost:4000/api`.

Tu peux override avec:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

## Routes principales

- `/register-admin`
- `/login`
- `/admin`
- `/admin/stalls`
- `/admin/vendors`
- `/admin/allocations`
- `/admin/payments`
- `/admin/debtors`
