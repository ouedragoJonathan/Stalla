# Créer un vendeur avec une dette (test Postman)

Une **dette** est créée automatiquement pour chaque stand **occupé** pour le mois en cours. Pour qu’un vendeur ait une dette, il faut donc : un stand, un vendeur, l’assignation du vendeur au stand, puis lancer le job qui crée les dettes.

Suivre ces étapes **dans l’ordre** dans Postman (avec `baseUrl` = `http://localhost:4000` et token **Admin**).

---

## 1. Se connecter en Admin

- **POST** `{{baseUrl}}/api/v1/auth/admin/login`
- Body (raw JSON) :
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
- Enregistrer le **token** (variable d’environnement `token` ou copier/coller dans l’onglet Authorization des requêtes suivantes).

---

## 2. Créer un stand

- **POST** `{{baseUrl}}/api/v1/stands`
- Headers : `Authorization: Bearer {{token}}`
- Body (raw JSON) :
```json
{
  "code": "A01",
  "zone": "Hall principal",
  "surface": 15.5,
  "monthlyRent": 25000
}
```
- Noter l’**id** du stand dans la réponse (ex. `1`).

---

## 3. Créer un vendeur

- **POST** `{{baseUrl}}/api/v1/vendors`
- Headers : `Authorization: Bearer {{token}}`
- Body (raw JSON) :
```json
{
  "name": "Jean Vendeur",
  "email": "jean.vendeur@example.com",
  "password": "secret123"
}
```
- Noter l’**id** du vendeur dans la réponse (ex. `2`).

---

## 4. Assigner le vendeur au stand

- **POST** `{{baseUrl}}/api/v1/stands/1/assign`  
  *(remplacer `1` par l’id du stand si différent)*
- Headers : `Authorization: Bearer {{token}}`
- Body (raw JSON) :
```json
{
  "vendorId": 2
}
```
*(remplacer `2` par l’id du vendeur créé à l’étape 3)*

---

## 5. Lancer le job des dettes

C’est cette route qui crée la dette du mois en cours pour tous les stands occupés.

- **POST** `{{baseUrl}}/api/v1/admin/run-debt-job`
- Headers : `Authorization: Bearer {{token}}`

Réponse attendue : `200` avec message « Job des dettes exécuté ».

---

## 6. Vérifier la dette

### En tant qu’admin (optionnel)

- Liste des stands : **GET** `{{baseUrl}}/api/v1/stands` → le stand doit être `occupied` avec `currentVendor` renseigné.
- Détail vendeur : **GET** `{{baseUrl}}/api/v1/vendors/2` (remplacer par l’id du vendeur).

### En tant que vendeur (voir « mes dettes »)

1. Se connecter en vendeur :  
   **POST** `{{baseUrl}}/api/v1/auth/vendor/login`  
   Body : `{ "email": "jean.vendeur@example.com", "password": "secret123" }`
2. Récupérer le token vendeur et l’utiliser dans les requêtes suivantes.
3. **GET** `{{baseUrl}}/api/v1/vendors/me/debts`

Tu dois voir une entrée avec le stand, le mois (ex. `2025-02`) et le montant (ex. `25000`). C’est la dette du vendeur pour ce stand ce mois-ci.

---

## Récap

| Étape | Action | Route |
|-------|--------|--------|
| 1 | Login admin | POST `/api/v1/auth/admin/login` |
| 2 | Créer stand | POST `/api/v1/stands` |
| 3 | Créer vendeur | POST `/api/v1/vendors` |
| 4 | Assigner vendeur au stand | POST `/api/v1/stands/:id/assign` |
| 5 | Créer les dettes du mois | POST `/api/v1/admin/run-debt-job` |
| 6 | Voir les dettes (vendeur) | GET `/api/v1/vendors/me/debts` (token vendeur) |

Sans l’étape 5, le vendeur n’aura pas de dette affichée dans `GET /api/v1/vendors/me/debts`.
