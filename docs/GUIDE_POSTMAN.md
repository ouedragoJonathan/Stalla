# Guide de test de l’API STALLA avec Postman

Ce guide permet de configurer Postman et de tester toutes les routes de l’API STALLA (gestion de stands, vendeurs et paiements).

---

## 1. Prérequis

- **Postman** installé ([postman.com](https://www.postman.com/downloads/))
- **Serveur API** démarré : `npm start` (par défaut sur `http://localhost:4000`)
- **Base MySQL** configurée (fichier `.env`) et accessible

---

## 2. Créer un environnement Postman

1. Dans Postman : **Environments** → **Create Environment**.
2. Nom : par ex. **STALLA – Local**.
3. Ajouter les variables :

   | Variable   | Valeur initiale      | Description              |
   |-----------|----------------------|--------------------------|
   | `baseUrl` | `http://localhost:4000` | URL de base de l’API   |
   | `token`   | *(laisser vide)*     | JWT après login (rempli manuellement ou par script) |

4. **Save** puis sélectionner cet environnement en haut à droite.

Dans les requêtes, utilisez `{{baseUrl}}` pour l’URL (ex. `{{baseUrl}}/api/v1/auth/admin/login`).

---

## 3. Authentification (obtenir le token)

Les routes protégées exigent un **JWT** dans le header :

```http
Authorization: Bearer <votre_token>
```

### 3.1 Connexion Admin

- **Méthode :** `POST`
- **URL :** `{{baseUrl}}/api/v1/auth/admin/login`
- **Body :** onglet **Body** → **raw** → **JSON**

```json
{
  "email": "admin@stalla.com",
  "password": "admin123"
}
```

*(Remplacez par l’email/mot de passe admin configurés en base.)*

- **Réponse attendue (200) :**  
  `data.token` et `data.user`. Copiez `data.token`.

### 3.2 Connexion Vendeur

- **Méthode :** `POST`
- **URL :** `{{baseUrl}}/api/v1/auth/vendor/login`
- **Body :** **raw** → **JSON**

```json
{
  "email": "vendeur@example.com",
  "password": "motdepasse123"
}
```

- Copiez `data.token` pour les requêtes vendeur.

### 3.3 Utiliser le token dans Postman

**Option A – Header manuel**  
Pour chaque requête protégée : onglet **Headers** →  
`Authorization` : `Bearer {{token}}`  
(après avoir mis la valeur de `token` dans l’environnement).

**Option B – Enregistrer le token après login**  
Dans l’onglet **Tests** de la requête **Login (admin ou vendeur)** :

```javascript
const res = pm.response.json();
if (res.data && res.data.token) {
  pm.environment.set("token", res.data.token);
}
```

Ensuite, dans **Authorization** des autres requêtes : Type **Bearer Token** → Token : `{{token}}`.

---

## 4. Requêtes par section

Toutes les URLs sont en `{{baseUrl}}/...`. Pour les routes protégées, utilisez **Authorization** → **Bearer Token** → `{{token}}`.

### 4.1 Auth

| Action        | Méthode | URL |
|---------------|---------|-----|
| Login admin   | POST    | `{{baseUrl}}/api/v1/auth/admin/login` |
| Login vendeur | POST   | `{{baseUrl}}/api/v1/auth/vendor/login` |

Body (JSON) : `{ "email": "...", "password": "..." }`.

---

### 4.2 Stands (token ADMIN ou VENDOR pour GET ; ADMIN seul pour les autres)

| Action           | Méthode | URL | Body / paramètres |
|------------------|---------|-----|-------------------|
| Liste des stands | GET     | `{{baseUrl}}/api/v1/stands` | Query : `?status=free` ou `?status=occupied` (optionnel) |
| Détail stand     | GET     | `{{baseUrl}}/api/v1/stands/1` | `1` = id du stand |
| Créer stand      | POST    | `{{baseUrl}}/api/v1/stands` | Voir ci‑dessous |
| Modifier stand   | PUT     | `{{baseUrl}}/api/v1/stands/1` | Champs à modifier (code, zone, surface, monthlyRent) |
| Supprimer stand  | DELETE  | `{{baseUrl}}/api/v1/stands/1` | — |
| Assigner vendeur | POST    | `{{baseUrl}}/api/v1/stands/1/assign` | `{ "vendorId": 2 }` |

**Exemple Body – Créer un stand (POST /api/v1/stands) :**

```json
{
  "code": "A01",
  "zone": "Hall principal",
  "surface": 15.5,
  "monthlyRent": 25000
}
```

**Exemple Body – Assigner un vendeur (POST /api/v1/stands/1/assign) :**

```json
{
  "vendorId": 2
}
```

---

### 4.3 Vendeurs (ADMIN sauf /me et /me/debts = VENDOR)

| Action              | Méthode | URL | Rôle  |
|---------------------|---------|-----|-------|
| Liste vendeurs      | GET     | `{{baseUrl}}/api/v1/vendors` | ADMIN |
| Créer vendeur       | POST    | `{{baseUrl}}/api/v1/vendors` | ADMIN |
| Mon profil          | GET     | `{{baseUrl}}/api/v1/vendors/me` | VENDOR |
| Mes dettes          | GET     | `{{baseUrl}}/api/v1/vendors/me/debts` | VENDOR |
| Modifier mon profil | PUT     | `{{baseUrl}}/api/v1/vendors/me` | VENDOR |
| Détail vendeur      | GET     | `{{baseUrl}}/api/v1/vendors/2` | ADMIN |
| Modifier vendeur    | PUT     | `{{baseUrl}}/api/v1/vendors/2` | ADMIN |
| Supprimer vendeur   | DELETE  | `{{baseUrl}}/api/v1/vendors/2` | ADMIN |

**Exemple Body – Créer un vendeur (POST /api/v1/vendors) :**

```json
{
  "name": "Jean Vendeur",
  "email": "jean@example.com",
  "password": "secret123"
}
```

**Exemple Body – Modifier mon profil (PUT /api/v1/vendors/me) :**

```json
{
  "name": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "password": "nouveaumdp"
}
```

*(Tous les champs sont optionnels ; n’envoyer que ceux à modifier.)*

---

### 4.4 Paiements

| Action            | Méthode | URL | Rôle |
|-------------------|---------|-----|------|
| Créer paiement    | POST    | `{{baseUrl}}/api/v1/payments` | ADMIN |
| Liste paiements   | GET     | `{{baseUrl}}/api/v1/payments` | ADMIN (tous) / VENDOR (les siens) |

**Exemple Body – Créer un paiement (POST /api/v1/payments) :**

```json
{
  "vendorId": 2,
  "standId": 1,
  "amount": 25000,
  "monthPaid": "2025-02",
  "method": "Espèces"
}
```

---

## 5. Vérification rapide (santé API)

- **Méthode :** GET  
- **URL :** `{{baseUrl}}/health`  
- **Auth :** aucune  
- Réponse attendue : `200` avec message du type « API STALLA opérationnelle ».

---

## 6. Ordre de test recommandé

1. **Health** : GET `{{baseUrl}}/health`
2. **Login admin** : POST login admin → enregistrer `token` (variable d’environnement ou Tests).
3. **Stands** : GET liste → POST créer → GET par id → PUT modifier → POST assign (avec un `vendorId` existant).
4. **Vendeurs** : POST créer vendeur → GET liste → GET `/me` avec token vendeur (login vendeur d’abord).
5. **Paiements** : POST créer paiement (admin) → GET liste (admin puis vendeur pour comparer).

En suivant ce guide, vous pouvez tester l’intégralité de l’API STALLA depuis Postman.
