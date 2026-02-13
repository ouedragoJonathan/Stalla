# Guide Postman - API STALLA (Spec v2)

Ce guide correspond au backend actuel basé sur les routes:
- `/api/auth/*`
- `/api/admin/*`
- `/api/vendor/*`

## 1. Prérequis

- API lancée sur `http://localhost:4000`
- Base MySQL accessible
- Postman installé

## 2. Environnement Postman

Créer un environnement avec:

- `baseUrl` = `http://localhost:4000`
- `adminToken` = *(vide)*
- `vendorToken` = *(vide)*
- `vendorId` = *(vide)*
- `stallId` = *(vide)*
- `allocationId` = *(vide)*

## 3. Authentification

## 3.1 Register Admin (web)

- **POST** `{{baseUrl}}/api/auth/register-admin`
- Body:

```json
{
  "name": "Admin Principal",
  "email": "admin.web@example.com",
  "password": "AdminPass123!"
}
```

## 3.2 Login (route unique)

- **POST** `{{baseUrl}}/api/auth/login`
- Body:

```json
{
  "identifier": "admin@stalla.com",
  "password": "admin123"
}
```

Réponse attendue:

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "...",
    "user": {
      "id": 1,
      "role": "ADMIN",
      "name": "Admin"
    }
  }
}
```

Script Postman (Tests) pour stocker un token selon le rôle:

```javascript
const res = pm.response.json();
if (res?.data?.token && res?.data?.user?.role === "ADMIN") {
  pm.environment.set("adminToken", res.data.token);
}
if (res?.data?.token && res?.data?.user?.role === "VENDOR") {
  pm.environment.set("vendorToken", res.data.token);
}
```

## 4. Flux Admin recommandé

Toutes les routes admin utilisent:
- Header `Authorization: Bearer {{adminToken}}`

## 4.1 Créer un stand

- **POST** `{{baseUrl}}/api/admin/stalls`
- Body:

```json
{
  "code": "A-101",
  "zone": "Zone A",
  "monthly_price": 30000
}
```

## 4.2 Lister les stands

- **GET** `{{baseUrl}}/api/admin/stalls`

## 4.3 Créer un vendeur

- **POST** `{{baseUrl}}/api/admin/vendors`
- Body:

```json
{
  "full_name": "Vendeur Test",
  "phone": "+22901020304",
  "business_type": "Textile",
  "email": "vendor1@example.com"
}
```

`email` est optionnel. La réponse contient `default_password` pour la première connexion vendeur.

## 4.4 Lister les vendeurs

- **GET** `{{baseUrl}}/api/admin/vendors`

## 4.5 Créer une allocation

- **POST** `{{baseUrl}}/api/admin/allocations`
- Body:

```json
{
  "vendor_id": 1,
  "stall_id": 1,
  "start_date": "2026-02-01"
}
```

## 4.6 Enregistrer un paiement

- **POST** `{{baseUrl}}/api/admin/payments`
- Body:

```json
{
  "allocation_id": 1,
  "amount_paid": 30000,
  "period": "2026-02"
}
```

## 4.7 Rapport débiteurs

- **GET** `{{baseUrl}}/api/admin/reports/debtors`

## 5. Flux Vendeur recommandé

Toutes les routes vendeur utilisent:
- Header `Authorization: Bearer {{vendorToken}}`

## 5.1 Login vendeur

- **POST** `{{baseUrl}}/api/auth/login`
- Body:

```json
{
  "identifier": "+22901020304",
  "password": "mot_de_passe_genere"
}
```

Tu peux aussi envoyer l'email s'il existe:

```json
{
  "identifier": "vendor1@example.com",
  "password": "mot_de_passe_genere"
}
```

## 5.2 Mon stand

- **GET** `{{baseUrl}}/api/vendor/my-stall`

## 5.3 Mes paiements

- **GET** `{{baseUrl}}/api/vendor/payments`

## 5.4 Ma balance

- **GET** `{{baseUrl}}/api/vendor/balance`

## 5.5 Réinitialiser mon mot de passe

- **POST** `{{baseUrl}}/api/vendor/reset-password`
- Body:

```json
{
  "current_password": "mot_de_passe_genere",
  "new_password": "MonNouveauPass@2026"
}
```

Réponse typique:

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

## 6. Healthcheck

- **GET** `{{baseUrl}}/health`
- Auth: aucune
