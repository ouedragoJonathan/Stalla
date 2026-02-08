# ApplicationWebPourGestionDeStand

# ApplicationWebPourGestionDeStand

# Stalla

API REST de gestion de stands pour marchés (vendeurs, loyers, paiements).

---

## Ce que fait l'API

L'API **STALLA** permet de :

- **Stands** : créer, modifier, supprimer des stands (code, zone, surface, loyer mensuel) et assigner un vendeur à un stand
- **Vendeurs** : gérer les comptes vendeurs (création par l’admin), profil, consultation des dettes
- **Paiements** : enregistrer les paiements de loyers, historique (admin / vendeur)
- **Authentification** : connexion Admin et Vendeur par JWT (Bearer token)
- **Dettes** : génération automatique par un job planifié (cron) pour les stands occupés
- **Documentation** : Swagger UI disponible à `/api-docs`

**Base URL par défaut :** `http://localhost:4000`

---

## Dépendances à installer

### Prérequis

- **Node.js** (v18 ou supérieur recommandé)
- **MySQL** (v5.7+ ou v8+)
- **npm** (inclus avec Node.js)

### Installation

1. Aller dans le dossier backend :

```bash
cd backend
```

2. Installer les dépendances :

```bash
npm install
```

### Dépendances du projet

| Package           | Rôle                              |
|-------------------|-----------------------------------|
| express           | Framework web                     |
| sequelize         | ORM base de données               |
| mysql2            | Driver MySQL                      |
| bcryptjs          | Hash des mots de passe            |
| jsonwebtoken      | Authentification JWT              |
| dotenv            | Variables d'environnement         |
| swagger-jsdoc     | Documentation API (Swagger)       |
| swagger-ui-express| Interface Swagger UI              |
| nodemon (dev)     | Redémarrage automatique en dev    |

---

## Configuration

Créer un fichier `.env` à la racine du dossier `backend` :

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stalla
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
JWT_SECRET=une_cle_secrete_longue_et_complexe
JWT_EXPIRES_IN=7d
```

- Créer la base MySQL `stalla` (ou le nom défini dans `DB_NAME`) avant le premier lancement
- Les tables sont créées/mises à jour automatiquement au démarrage (`sequelize.sync`)
- Un compte admin est créé automatiquement s'il n'existe pas : `admin@example.com` / `admin123` (à changer en production)

---

## Lancer l'API

### Mode production

```bash
cd backend
npm start
```

### Mode développement (avec rechargement automatique)

```bash
cd backend
npm run dev
```

L'API écoute par défaut sur **http://localhost:4000**.

### Vérifier que l'API fonctionne

```bash
GET http://localhost:4000/health
```

Réponse attendue : `200` avec message « API STALLA opérationnelle ».

---

## Documentation et tests

- **Swagger UI** : http://localhost:4000/api-docs
- **Guide Postman** : voir [docs/GUIDE_POSTMAN.md](docs/GUIDE_POSTMAN.md)
- **Documentation API complète** : voir [docs/DOCUMENTATION_API.md](docs/DOCUMENTATION_API.md)
