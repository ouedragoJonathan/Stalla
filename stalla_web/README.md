# Stalla Web (Admin)

Frontend React/Vite de l'administration Stalla: gestion des stands, vendeurs, allocations, paiements, débiteurs et paramètres support.

Ce README est pensé pour être donné à un agent design (ex: Gemini) afin qu'il puisse refaire/améliorer l'UI **sans casser la logique fonctionnelle**.

## 1) Stack et prérequis

- React 18 + TypeScript
- Vite 5
- React Router DOM 6
- Node.js 18+ recommandé

## 2) Installation et lancement

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

## 3) Configuration (.env)

Variable utilisée:

- `VITE_API_BASE_URL` (optionnelle)
  - défaut: `http://localhost:4000/api`
  - définie dans `src/core/constants.ts`

Exemple:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

## 4) Scripts NPM

- `npm run dev`: lance le serveur Vite (port 5173)
- `npm run build`: typecheck + build
- `npm run preview`: preview du build

## 5) Architecture du projet

```text
stalla_web/
  public/
    logo.png
  src/
    app/
      AuthContext.tsx
    components/
      AdminLayout.tsx
    core/
      api.ts
      constants.ts
      storage.ts
      types.ts
    features/
      auth/
        authService.ts
        pages/
          LoginPage.tsx
          RegisterPage.tsx
      admin/
        adminService.ts
        pages/
          DashboardPage.tsx
          StallsPage.tsx
          VendorsPage.tsx
          AllocationsPage.tsx
          PaymentsPage.tsx
          DebtorsPage.tsx
          SupportSettingsPage.tsx
    guards/
      RequireAuth.tsx
      RequireAdmin.tsx
    App.tsx
    main.tsx
    index.css
```

## 6) Routing et contrôle d'accès

Défini dans `src/App.tsx`.

- `/login`: connexion admin
- `/register`: création d'un compte admin
- `/admin` (protégé auth + rôle admin)
  - `/admin` (Dashboard)
  - `/admin/stalls`
  - `/admin/vendors`
  - `/admin/allocations`
  - `/admin/payments`
  - `/admin/debtors`
  - `/admin/support`

Guards:

- `RequireAuth`: redirige vers `/login` si non connecté
- `RequireAdmin`: redirige vers `/login` si rôle différent de `ADMIN`

## 7) Authentification et session

Fichiers clés:

- `src/app/AuthContext.tsx`
- `src/features/auth/authService.ts`
- `src/core/storage.ts`

Fonctionnement:

1. Login via `POST /auth/login`
2. Register admin via `POST /auth/register-admin`
3. Si succès: token + user stockés en `localStorage`
4. Toutes les requêtes API ajoutent `Authorization: Bearer <token>` si token présent
5. Si réponse HTTP 401: session supprimée (`clearSession`)

Clés localStorage:

- `stalla_admin_token`
- `stalla_admin_user`

## 8) Couche API

Wrapper central: `src/core/api.ts` (`apiRequest`)

- Gère `GET/POST/PUT/DELETE`
- Parse JSON réponse
- Retourne un format `ApiResponse<T>`
- Message d'erreur standard si backend indisponible

Services:

- `src/features/auth/authService.ts`
- `src/features/admin/adminService.ts`

## 9) Endpoints backend consommés

### Auth

- `POST /auth/login`
- `POST /auth/register-admin`

### Admin

- `GET /admin/stalls`
- `POST /admin/stalls`
- `GET /admin/vendors`
- `POST /admin/vendors`
- `POST /admin/allocations`
- `POST /admin/payments`
- `GET /admin/reports/debtors`
- `GET /admin/settings/support`
- `PUT /admin/settings/support`

## 10) Pages et comportement métier

### Login (`LoginPage.tsx`)

- Formulaire: identifiant (email/téléphone) + mot de passe
- Appelle `loginAdmin(...)`
- Redirection vers `/admin` si succès

### Register (`RegisterPage.tsx`)

- Formulaire: nom, email, mot de passe
- Appelle `registerAdmin(...)`
- Redirection vers `/admin` si succès

### Dashboard (`DashboardPage.tsx`)

- Charge en parallèle:
  - stands
  - vendeurs
  - débiteurs
- Affiche des KPI (totaux, occupation, dette, recouvrement)
- Affichage style "bento grid"

### Stands (`StallsPage.tsx`)

- Création d'un stand (`code`, `zone`, `monthly_price`)
- Liste des stands + statut + vendeur actif

### Vendors (`VendorsPage.tsx`)

- Création vendeur (`full_name`, `phone`, `business_type`, `email?`)
- Affiche message avec mot de passe initial si renvoyé par l'API
- Liste des vendeurs

### Allocations (`AllocationsPage.tsx`)

- Associe un vendeur à un stand (`vendor_id`, `stall_id`, `start_date`)
- Liste des stands + allocation active
- Filtre local des stands disponibles

### Payments (`PaymentsPage.tsx`)

- Enregistre un paiement (`allocation_id`, `amount_paid`, `period`)
- Propose uniquement les allocations actives
- Affiche un tableau des allocations actives

### Debtors (`DebtorsPage.tsx`)

- Affiche la liste des débiteurs et montants (dû/payé/dette)

### Support (`SupportSettingsPage.tsx`)

- Lecture et mise à jour du numéro de support client

## 11) Design system actuel (important pour refonte UI)

Deux styles coexistent:

1. **Global CSS** dans `src/index.css` (layout admin, tables, cards, variables CSS)
2. **CSS inline via `<style>` dans les pages**:
   - `LoginPage.tsx`
   - `RegisterPage.tsx`
   - `DashboardPage.tsx`

Conséquence:

- Ces 3 pages peuvent ignorer/écraser partiellement le style global.
- Une refonte design propre doit idéalement centraliser les styles (ou garder un pattern cohérent).

## 12) Contraintes strictes pour un agent design (Gemini)

Gemini peut modifier:

- markup JSX
- classes CSS
- `src/index.css`
- création de nouveaux fichiers CSS/modules/components UI

Gemini ne doit pas casser:

- noms des routes
- logique des formulaires (`handleSubmit`, validations)
- appels API (`adminService`, `authService`)
- structure des payloads backend
- logique d'auth et guards

Points d'attention:

- Garder les `name/value/onChange` cohérents dans les formulaires
- Conserver les états `loading`, `saving`, `message`
- Conserver les redirections post-login/register

## 13) Contrat de données (types)

Types principaux dans `src/core/types.ts`:

- `AuthUser`, `AuthPayload`, `ApiResponse<T>`
- `Stand`, `Vendor`, `Allocation`, `Payment`, `Debtor`, `SupportSettings`

Si le design introduit de nouveaux composants, ne pas changer ces interfaces sans alignement backend.

## 14) Prompt prêt à copier pour Gemini (design only)

```text
Tu interviens sur le frontend React + TypeScript (Vite) du dossier stalla_web.
Objectif: améliorer le design/UI uniquement (look & feel, ergonomie, responsive) sans casser la logique métier existante.

Contraintes obligatoires:
1) Ne modifie pas les endpoints API ni la logique des services (src/features/**/services).
2) Ne modifie pas les routes (src/App.tsx) ni les guards.
3) Ne casse pas les formulaires (états React, submit handlers, validations).
4) Conserve les comportements de chargement, succès, erreurs.
5) Priorise une UI cohérente entre Login/Register/Dashboard et les autres pages admin.
6) Rends l'interface responsive mobile/tablette/desktop.
7) Si tu déplaces du CSS inline vers des fichiers dédiés, fais-le proprement sans régression.

Livrables attendus:
- code modifié
- résumé des fichiers touchés
- checklist de non-régression fonctionnelle
```

## 15) Vérification rapide après refonte UI

Checklist manuelle:

1. Login fonctionne et redirige vers `/admin`
2. Logout fonctionne
3. Register admin fonctionne
4. Chaque page admin charge sans erreur JS
5. Création stand/vendeur/allocation/paiement fonctionne
6. Support phone se met à jour
7. Responsive correct sur mobile (sidebar, tableaux, formulaires)

## 16) Commandes utiles de debug

```bash
# lancer en dev
npm run dev

# build production
npm run build

# preview build
npm run preview
```

---

Pour toute refonte, partir de ce README + du code existant et appliquer des changements incrémentaux pour limiter les régressions.
