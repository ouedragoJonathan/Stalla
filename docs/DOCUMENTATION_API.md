# Documentation de l’API STALLA – Gestion de Stands

Ce document décrit le fonctionnement de l’API, le format des réponses, l’authentification et chaque route en détail.

---

## 1. Vue d’ensemble

L’API **STALLA** permet de gérer :

- **Stands** : création, modification, suppression, assignation à un vendeur.
- **Vendeurs** : comptes vendeurs (création par l’admin, profil et dettes côté vendeur).
- **Paiements** : enregistrement des paiements de loyers et historique (admin / vendeur).
- **Authentification** : connexion Admin et Vendeur par JWT.

**Base URL (développement) :** `http://localhost:4000`  
**Préfixe des routes métier :** `/api/v1/`

---

## 2. Format des réponses

Toutes les réponses sont en **JSON** et suivent le même schéma :

```json
{
  "success": true,
  "message": "Message descriptif",
  "data": { ... }
}
```

En cas d’erreur :

```json
{
  "success": false,
  "message": "Message d'erreur",
  "errors": {
    "champ": "Détail de l'erreur"
  }
}
```

- **success** : `true` en cas de succès, `false` en cas d’erreur.
- **message** : texte court pour l’utilisateur.
- **data** : présent en succès (peut être `null` pour certaines suppressions).
- **errors** : présent en erreur, objet avec détails par champ ou type.

Le **code HTTP** reflète le résultat (200, 201, 400, 401, 403, 404, 500).

---

## 3. Authentification et autorisation

### 3.1 JWT

Les routes protégées exigent un **token JWT** dans le header :

```http
Authorization: Bearer <token>
```

Le token est obtenu via :

- **POST /api/v1/auth/admin/login** → rôle **ADMIN**
- **POST /api/v1/auth/vendor/login** → rôle **VENDOR**

En cas de token manquant, invalide ou expiré : réponse **401** avec `message` et `errors.auth`.

### 3.2 Rôles

- **ADMIN** : accès à toutes les routes admin (stands, vendeurs, paiements, assignation).
- **VENDOR** : accès aux stands en lecture, à son profil (`/vendors/me`), ses dettes (`/vendors/me/debts`) et à la liste de ses paiements.

Si le rôle n’est pas autorisé pour la route : **403** avec `errors.permission`.

---

## 4. Détail des routes

### 4.1 Santé de l’API

| Méthode | Chemin    | Auth | Description |
|---------|-----------|------|-------------|
| GET     | `/health` | Non  | Vérifie que l’API répond. |

**Réponse 200 :**

```json
{
  "success": true,
  "message": "API STALLA opérationnelle",
  "data": { "uptime": 123.456 }
}
```

---

### 4.2 Auth

#### POST /api/v1/auth/admin/login

Connexion **administrateur**.  
Auth : **aucune**.

**Body (JSON) :**

| Champ     | Type   | Obligatoire | Description      |
|-----------|--------|-------------|------------------|
| email     | string | Oui         | Email de l’admin |
| password  | string | Oui         | Mot de passe     |

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Connexion administrateur réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@stalla.com",
      "role": "ADMIN"
    }
  }
}
```

**Erreurs :**

- **400** : `email` ou `password` manquant.
- **401** : identifiants incorrects.

---

#### POST /api/v1/auth/vendor/login

Connexion **vendeur**.  
Auth : **aucune**.

**Body (JSON) :** même structure que admin (`email`, `password`).

**Réponse 200 :** même forme que admin, avec `role: "VENDOR"` et `token` JWT.

**Erreurs :** 400 (champs manquants), 401 (identifiants incorrects).

---

### 4.3 Stands

Base : **/api/v1/stands**.  
Sauf mention contraire : **Bearer token requis**.  
Création, modification, suppression et assignation : **ADMIN** uniquement.  
Lecture (liste, détail) : **ADMIN** ou **VENDOR**.

---

#### GET /api/v1/stands

Liste tous les stands, avec le vendeur assigné le cas échéant.

**Query (optionnel) :**

| Paramètre | Type   | Description                    |
|-----------|--------|--------------------------------|
| status    | string | `free` ou `occupied` (filtre)  |

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Liste des stands",
  "data": [
    {
      "id": 1,
      "code": "A01",
      "zone": "Hall principal",
      "surface": "15.50",
      "monthlyRent": "25000.00",
      "status": "occupied",
      "currentVendorId": 2,
      "currentVendor": {
        "id": 2,
        "name": "Jean Vendeur",
        "email": "jean@example.com"
      },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

Si le stand est libre : `currentVendor` est `null`, `currentVendorId` peut être `null`.

---

#### GET /api/v1/stands/:id

Détail d’un stand par son `id`.

**Paramètre chemin :** `id` (entier).

**Réponse 200 :** un seul objet stand (même structure que dans la liste ci‑dessus).

**Erreurs :** **404** si stand introuvable.

---

#### POST /api/v1/stands

Création d’un stand. **ADMIN** uniquement.

**Body (JSON) :**

| Champ       | Type   | Obligatoire | Description                |
|-------------|--------|-------------|----------------------------|
| code        | string | Oui         | Code unique du stand       |
| zone        | string | Oui         | Zone (ex. « Hall principal ») |
| surface     | number | Oui         | Surface (m²)               |
| monthlyRent | number | Oui         | Loyer mensuel              |

**Réponse 201 :** `data` = stand créé (id, code, zone, surface, monthlyRent, status, etc.).

**Erreurs :**

- **400** : champs manquants ou `code` déjà utilisé.
- **403** : pas admin.

---

#### PUT /api/v1/stands/:id

Modification d’un stand. **ADMIN** uniquement.

**Paramètre chemin :** `id` (entier).

**Body (JSON) :** tous les champs optionnels ; seuls ceux envoyés sont mis à jour.

| Champ       | Type   | Description     |
|-------------|--------|-----------------|
| code        | string | Nouveau code    |
| zone        | string | Nouvelle zone   |
| surface     | number | Nouvelle surface |
| monthlyRent | number | Nouveau loyer   |

Si `code` est modifié, il doit rester unique (sinon **400**).

**Réponse 200 :** `data` = stand mis à jour.

**Erreurs :** **404** (stand introuvable), **400** (code dupliqué), **403** (pas admin).

---

#### DELETE /api/v1/stands/:id

Suppression d’un stand. **ADMIN** uniquement.

**Paramètre chemin :** `id`.

Un stand **occupé** ne peut pas être supprimé : **400** avec message invitant à libérer le stand (désassigner le vendeur).

**Réponse 200 :** `data: null`, `message` du type « Stand supprimé avec succès ».

**Erreurs :** **404** (stand introuvable), **400** (stand occupé), **403** (pas admin).

---

#### POST /api/v1/stands/:id/assign

Assigne un vendeur à un stand (stand passé en « occupé »). **ADMIN** uniquement.

**Paramètre chemin :** `id` (id du stand).

**Body (JSON) :**

| Champ     | Type    | Obligatoire | Description   |
|-----------|---------|-------------|---------------|
| vendorId  | integer | Oui         | Id du vendeur |

**Réponse 200 :** `data` = stand mis à jour avec `currentVendor` et `status: "occupied"`.

**Erreurs :**

- **400** : `vendorId` manquant.
- **404** : stand ou vendeur introuvable.
- **403** : pas admin.

---

### 4.4 Vendeurs

Base : **/api/v1/vendors**.  
Toutes les routes nécessitent un **Bearer token**.

- **ADMIN** : liste, création, détail par id, suppression.  
- **VENDOR** : `/me`, `/me/debts`, PUT `/me` (profil et dettes uniquement).

---

#### GET /api/v1/vendors

Liste de tous les vendeurs. **ADMIN** uniquement.

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Liste des vendeurs",
  "data": [
    {
      "id": 2,
      "name": "Jean Vendeur",
      "email": "jean@example.com",
      "role": "VENDOR",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

Le champ `password` n’est jamais renvoyé.

---

#### POST /api/v1/vendors

Création d’un vendeur. **ADMIN** uniquement.

**Body (JSON) :**

| Champ    | Type   | Obligatoire | Description   |
|----------|--------|-------------|---------------|
| name     | string | Oui         | Nom           |
| email    | string | Oui         | Email unique  |
| password | string | Oui         | Mot de passe  |

Le mot de passe est hashé côté serveur (bcrypt).

**Réponse 201 :** `data` = `{ id, name, email, role }` (sans password).

**Erreurs :** **400** (champs manquants ou email déjà utilisé), **403** (pas admin).

---

#### GET /api/v1/vendors/me

Profil du vendeur connecté + stand assigné. **VENDOR** uniquement.

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Profil du vendeur connecté",
  "data": {
    "user": { "id": 2, "name": "...", "email": "...", "role": "VENDOR" },
    "stand": { "id": 1, "code": "A01", "zone": "...", ... }
  }
}
```

Si aucun stand n’est assigné : `stand` est `null`.

**Erreurs :** **403** (pas vendeur), **404** (utilisateur introuvable).

---

#### GET /api/v1/vendors/me/debts

Dettes **non payées** du vendeur connecté. **VENDOR** uniquement.

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Dettes du vendeur connecté",
  "data": {
    "total": 50000,
    "debts": [
      {
        "id": 1,
        "vendorId": 2,
        "standId": 1,
        "month": "2025-01",
        "amount": "25000.00",
        "isPaid": false,
        "Stand": { "id": 1, "code": "A01", "zone": "...", "monthlyRent": "25000.00" }
      }
    ]
  }
}
```

Les dettes sont générées par un job planifié (cron) pour les stands occupés.

---

#### PUT /api/v1/vendors/me

Modification du profil du vendeur connecté (nom, email, mot de passe). **VENDOR** uniquement.

**Body (JSON) :** tous optionnels.

| Champ    | Type   | Description        |
|----------|--------|--------------------|
| name     | string | Nouveau nom        |
| email    | string | Nouvel email       |
| password | string | Nouveau mot de passe |

Si `email` est modifié, il doit rester unique.

**Réponse 200 :** `data` = utilisateur mis à jour (sans password).

**Erreurs :** **400** (email déjà utilisé), **403** (pas vendeur), **404** (vendeur introuvable).

---

#### GET /api/v1/vendors/:id

Détail d’un vendeur par id + son stand assigné. **ADMIN** uniquement.

**Paramètre chemin :** `id` (entier).

**Réponse 200 :** `data` = `{ vendor: { ... }, stand: { ... } | null }`.

**Erreurs :** **404** (vendeur introuvable), **403** (pas admin).

---

#### PUT /api/v1/vendors/:id

Comportement actuel : l’admin **ne peut pas** modifier nom, email ou mot de passe d’un vendeur (403 avec message explicite). La route renvoie en succès le vendeur tel quel. **ADMIN** uniquement.

**Paramètre chemin :** `id`.

**Body (JSON) :** aucun champ métier accepté pour modification par l’admin.

**Réponse 200 :** `data` = fiche vendeur (sans password).

**Erreurs :** **403** si tentative de modifier name/email/password, **404** si vendeur introuvable.

---

#### DELETE /api/v1/vendors/:id

Suppression d’un vendeur. **ADMIN** uniquement. Les stands assignés à ce vendeur sont automatiquement libérés (`currentVendorId` = null, `status` = free).

**Paramètre chemin :** `id`.

**Réponse 200 :** `data: null`, message de succès.

**Erreurs :** **404** (vendeur introuvable), **403** (pas admin).

---

### 4.5 Paiements

Base : **/api/v1/payments**.  
Toutes les routes nécessitent un **Bearer token**.

---

#### POST /api/v1/payments

Enregistrement d’un paiement (loyer). **ADMIN** uniquement.

**Body (JSON) :**

| Champ     | Type    | Obligatoire | Description                          |
|-----------|---------|-------------|--------------------------------------|
| vendorId  | integer | Oui         | Id du vendeur                        |
| standId   | integer | Oui         | Id du stand                          |
| amount    | number  | Oui         | Montant payé                         |
| monthPaid | string  | Oui         | Mois concerné (format **YYYY-MM**)   |
| method    | string  | Oui         | Méthode de paiement (ex. « Espèces ») |

Le paiement est enregistré et la dette correspondante (vendor + stand + mois) est marquée comme payée. Un reçu PDF peut être généré (optionnel ; en cas d’échec PDF, le paiement est tout de même enregistré).

**Réponse 201 :** `data` = objet paiement (id, vendorId, standId, amount, monthPaid, method, receiptPath, timestamps).

**Erreurs :** **400** (champs manquants), **404** (vendeur ou stand introuvable), **403** (pas admin).

---

#### GET /api/v1/payments

Liste des paiements.

- **ADMIN** : tous les paiements.
- **VENDOR** : uniquement les paiements du vendeur connecté.

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Historique des paiements",
  "data": [
    {
      "id": 1,
      "vendorId": 2,
      "standId": 1,
      "amount": "25000.00",
      "monthPaid": "2025-02",
      "method": "Espèces",
      "receiptPath": "/receipts/...",
      "vendor": { "id": 2, "name": "...", "email": "..." },
      "stand": { "id": 1, "code": "A01", "zone": "..." },
      "createdAt": "..."
    }
  ]
}
```

**Erreurs :** **401** (non authentifié), **403** (rôle insuffisant).

---

## 5. Codes HTTP récapitulatifs

| Code | Signification |
|------|----------------|
| 200  | Succès (lecture, mise à jour, suppression) |
| 201  | Ressource créée (stand, vendeur, paiement) |
| 400  | Données invalides ou règle métier (ex. code dupliqué, stand occupé) |
| 401  | Non authentifié ou token invalide/expiré |
| 403  | Authentifié mais pas le droit (rôle insuffisant ou règle métier) |
| 404  | Ressource introuvable (stand, vendeur, etc.) |
| 500  | Erreur serveur (base de données, exception) |

---

## 6. Rappel technique

- **Documentation interactive :** Swagger UI disponible à `http://localhost:4000/api-docs`.
- **Fichiers statiques :** reçus PDF servis sous `/receipts/`.
- **Dettes :** créées par un job planifié (cron) pour les stands occupés ; consultables par le vendeur via `GET /api/v1/vendors/me/debts`.

Cette documentation et le [Guide Postman](GUIDE_POSTMAN.md) permettent de comprendre et de tester l’intégralité de l’API STALLA.
