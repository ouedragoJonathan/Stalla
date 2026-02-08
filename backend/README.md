# ApplicationWebPourGestionDeStand

# ApplicationWebPourGestionDeStand

<<<<<<< HEAD
=======
# ApplicationWebPourGestionDeStand

>>>>>>> 470b84ee8cbe462504e99f2a113bdae033920190
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

<<<<<<< HEAD
## Lancer avec Docker

L'API et MySQL peuvent être lancés ensemble avec Docker Compose (sans installer Node.js ni MySQL sur la machine).

### Prérequis

- **Docker Desktop** installé sur Windows ([télécharger](https://www.docker.com/products/docker-desktop/))
- Lancer Docker Desktop avant de lancer les conteneurs

### 1. Configurer le fichier .env

Le fichier `backend/.env` est utilisé par Docker. Assurez-vous qu'il contient :

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stalla
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=une_cle_secrete
JWT_EXPIRES_IN=7d

# Obligatoire pour Docker (MySQL refuse MYSQL_USER=root)
MYSQL_ROOT_PASSWORD=root_secret
```

> **Note :** En Docker, l'API se connecte automatiquement avec l'utilisateur `stalla` (créé dans le conteneur MySQL), pas avec `DB_USER` du .env. Pour le lancement local (sans Docker), utilisez `DB_USER=root` ou votre utilisateur MySQL.

### 2. Démarrer les conteneurs

Depuis le dossier **Stalla** (parent de `backend`) :

```bash
cd Stalla
docker compose --env-file ./backend/.env up -d
```

- **API** : http://localhost:4000  
- **MySQL** : port 3307 sur l'hôte (3306 dans le conteneur) — évite le conflit avec un MySQL local

### 3. Vérifier que tout fonctionne

```bash
docker compose ps
```

Les deux conteneurs doivent être `Up` et MySQL `healthy`. Puis tester l'API :

```bash
curl http://localhost:4000/health
```

Ou dans le navigateur : http://localhost:4000/health et http://localhost:4000/api-docs

### 4. Arrêter les conteneurs

```bash
cd Stalla
docker compose down
```

Les données MySQL sont conservées dans un volume. Pour tout supprimer (conteneurs + volumes) :

```bash
docker compose down -v
```

### Commandes Docker utiles

| Commande | Description |
|----------|-------------|
| `docker compose --env-file ./backend/.env up -d` | Démarrer en arrière-plan |
| `docker compose down` | Arrêter les conteneurs |
| `docker compose down -v` | Arrêter et supprimer les volumes (données MySQL) |
| `docker compose ps` | Voir le statut des conteneurs |
| `docker compose logs api` | Voir les logs de l'API |
| `docker compose logs mysql` | Voir les logs MySQL |
| `docker compose logs -f api` | Suivre les logs de l'API en direct |
| `docker compose build --no-cache` | Reconstruire l'image (après modification du code) |

### Compte admin par défaut

Après le premier démarrage : `admin@example.com` / `admin123`

---

=======
>>>>>>> 470b84ee8cbe462504e99f2a113bdae033920190
## Documentation et tests

- **Swagger UI** : http://localhost:4000/api-docs
- **Guide Postman** : voir [docs/GUIDE_POSTMAN.md](docs/GUIDE_POSTMAN.md)
- **Documentation API complète** : voir [docs/DOCUMENTATION_API.md](docs/DOCUMENTATION_API.md)

