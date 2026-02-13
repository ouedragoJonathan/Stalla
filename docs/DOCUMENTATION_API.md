# Documentation API STALLA (Spec v2)

## 1. Vue d'ensemble

API REST pour la gestion de:
- stands de marché
- vendeurs
- allocations (attribution vendeur-stand)
- paiements
- dette (calcul dynamique)

Base URL locale: `http://localhost:4000`

Préfixes de routes:
- `POST /api/auth/register-admin`
- `POST /api/auth/login`
- `/api/admin/*` (ADMIN)
- `/api/vendor/*` (VENDOR)

## 2. Authentification

Toutes les routes sauf login/health exigent:

`Authorization: Bearer <token>`

Important: il n'y a plus de compte admin créé automatiquement au démarrage. Le premier admin doit être créé via `POST /api/auth/register-admin`.

## 2.1 Register Admin (web)

### POST `/api/auth/register-admin`

Body:

```json
{
  "name": "Admin Principal",
  "email": "admin.web@example.com",
  "password": "AdminPass123!"
}
```

## 2.2 Login unique

### POST `/api/auth/login`

Body:

```json
{
  "identifier": "user@example.com ou +22901020304",
  "password": "secret"
}
```

`identifier` accepte:
- email (ADMIN ou VENDOR)
- téléphone (VENDOR uniquement)

Réponse 200:

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "jwt",
    "user": {
      "id": 1,
      "role": "ADMIN",
      "name": "Admin"
    }
  }
}
```

## 3. Routes Admin

Toutes ces routes exigent un token ADMIN.

## 3.1 Stands

### GET `/api/admin/stalls`
Liste tous les stands et allocation active éventuelle.

### POST `/api/admin/stalls`
Crée un stand.

Body:

```json
{
  "code": "A-101",
  "zone": "Zone A",
  "monthly_price": 30000
}
```

## 3.2 Vendeurs

### GET `/api/admin/vendors`
Liste les vendeurs.

### POST `/api/admin/vendors`
Crée un compte vendeur (`User` + `Vendor`) et génère un mot de passe initial.

Body:

```json
{
  "full_name": "Vendeur Test",
  "phone": "+22901020304",
  "business_type": "Textile",
  "email": "vendor1@example.com"
}
```

`email` est optionnel, `phone` est obligatoire.

Réponse contient `default_password`.

SMS (Twilio):
- Si Twilio est configuré, un SMS est envoyé au vendeur avec l'identifiant et le mot de passe.

## 3.3 Allocations

### POST `/api/admin/allocations`
Assigne un vendeur à un stand.

Body:

```json
{
  "vendor_id": 1,
  "stall_id": 1,
  "start_date": "2026-02-01"
}
```

Règle: un stand déjà attribué sur une période active ne peut pas recevoir une nouvelle allocation active.

## 3.4 Paiements

### POST `/api/admin/payments`
Enregistre un paiement physique.

Body:

```json
{
  "allocation_id": 1,
  "amount_paid": 30000,
  "period": "2026-02"
}
```

## 3.5 Rapport débiteurs

### GET `/api/admin/reports/debtors`
Retourne les vendeurs avec `current_debt > 0`.

## 4. Routes Vendeur

Toutes ces routes exigent un token VENDOR.

## 4.1 Mon stand

### GET `/api/vendor/my-stall`
Réponse:

```json
{
  "success": true,
  "message": "Stand du vendeur",
  "data": {
    "stall_code": "A-101",
    "zone": "Zone A",
    "monthly_price": 30000,
    "end_date": null,
    "days_remaining": null
  }
}
```

## 4.2 Mes paiements

### GET `/api/vendor/payments`
Historique des paiements de toutes ses allocations.

## 4.3 Ma balance

### GET `/api/vendor/balance`
Réponse:

```json
{
  "success": true,
  "message": "Situation financière du vendeur",
  "data": {
    "total_paid": 30000,
    "total_due": 60000,
    "current_debt": 30000
  }
}
```

## 4.4 Réinitialiser mon mot de passe

### POST `/api/vendor/reset-password`

Body:

```json
{
  "current_password": "ancien",
  "new_password": "nouveau"
}
```

## 5. Logique de dette

Formule:

`Dette = (Nombre de mois occupés * monthly_price) - Somme des amount_paid`

Le calcul est dynamique à partir des allocations et paiements.

## 6. Route système

### GET `/health`
Vérifie l'état de l'API.

### POST `/api/admin/run-debt-job`
Route manuelle (ADMIN) pour exécuter le job technique de synchronisation mensuelle.
