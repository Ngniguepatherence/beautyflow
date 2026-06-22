# BeautySpace / LeaderSalon - SaaS Frontend 🚀

Bienvenue sur le dépôt front-end de la plateforme de gestion SaaS dédiée aux salons de beauté, coiffeurs et professionnels du bien-être. Cette application permet aux gérants de salons d'administrer leur activité de A à Z et offre aux clients une interface fluide pour la prise de rendez-vous en ligne.

## 📋 Table des matières

- [Aperçu du Projet](#-aperçu-du-projet)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Stack Technique](#-stack-technique)
- [Structure du Projet](#-structure-du-projet)
- [Prérequis](#-prérequis)
- [Installation et Démarrage](#-installation-et-démarrage)
- [Scripts Disponibles](#-scripts-disponibles)
- [Environnement](#-environnement)

## 🌟 Aperçu du Projet

L'application se divise en 3 grands espaces :
1. **Espace Professionnel (Salon)** : Gestion des rendez-vous, des clients (CRM), du stock, du programme de fidélité, des campagnes marketing et des finances.
2. **Espace Client (Public)** : Annuaire des salons (Public Explorer), prise de rendez-vous en ligne (Booking Flow), gestion de compte client.
3. **Espace Administrateur** : Super-administration de la plateforme SaaS, gestion des abonnements et suivi des métriques globales.

## ✨ Fonctionnalités Principales

### Pour les Gérants de Salon
- **Tableau de Bord** : Vue d'ensemble des statistiques, revenus et prochains rendez-vous.
- **Agenda & Rendez-vous** : Gestion du planning, rappels automatisés.
- **Prestations & Catalogue** : Définition des services, durées et tarifs.
- **CRM & Fidélité** : Fichiers clients, historique, points de fidélité.
- **Finances & Facturation** : Suivi du chiffre d'affaires, paiements.
- **Gestion de Stock** : Suivi des produits, alertes de rupture de stock.
- **Marketing** : Création de campagnes SMS/Email, promotions.

### Pour les Clients
- **Prise de Rendez-vous** : Tunnel de réservation intuitif et adaptatif.
- **Compte Client** : Suivi de ses rendez-vous, annulations, historique.
- **Explorateur** : Recherche de salons à proximité par catégories.

## 🛠 Stack Technique

Ce projet utilise des technologies modernes pour garantir performance, maintenabilité et une excellente expérience utilisateur.

- **Framework** : [React 18](https://react.dev/)
- **Build Tool** : [Vite](https://vitejs.dev/)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Routing** : [React Router v6](https://reactrouter.com/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)
- **Composants UI** : [shadcn/ui](https://ui.shadcn.com/) (basé sur Radix UI)
- **Gestion des Requêtes/État** : [TanStack React Query](https://tanstack.com/query/latest)
- **Formulaires & Validation** : [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Graphiques** : [Recharts](https://recharts.org/)
- **PWA** : Support via `vite-plugin-pwa`
- **Tests** : [Vitest](https://vitest.dev/) & React Testing Library
- **Linting** : ESLint

## 📂 Structure du Projet

```text
src/
├── assets/         # Images, icônes et autres assets statiques
├── components/     # Composants React réutilisables (shadcn/ui, composants partagés)
├── contexts/       # Contextes React (Auth, Theme, etc.)
├── hooks/          # Custom hooks (logique métier, gestion d'état)
├── lib/            # Utilitaires (formatteurs, configuration Axios, utils shadcn)
├── pages/          # Vues de l'application (Dashboard, Login, Booking, etc.)
├── test/           # Fichiers de tests unitaires et d'intégration
├── types/          # Définitions de types TypeScript (interfaces, models)
├── App.tsx         # Composant racine avec définition des routes
├── main.tsx        # Point d'entrée de l'application
└── index.css       # Styles globaux et variables CSS (Tailwind)
```

## ⚙️ Prérequis

Assurez-vous d'avoir installé les éléments suivants sur votre machine :
- **Node.js** (version 18+ recommandée)
- **npm**, **yarn** ou **pnpm** (le projet utilise npm par défaut)

## 🚀 Installation et Démarrage

1. **Cloner le dépôt :**
   ```bash
   git clone <URL_DU_DEPOT>
   cd remix-of-remix-of-fid-le-beautyds
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   # ou yarn install / pnpm install
   ```

3. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   L'application sera accessible par défaut sur [http://localhost:8080](http://localhost:8080) (ou le port défini par Vite).

## 📜 Scripts Disponibles

Dans le dossier du projet, vous pouvez exécuter les commandes suivantes :

- `npm run dev` : Lance l'application en mode développement avec Hot Module Replacement (HMR).
- `npm run build` : Construit l'application pour la production dans le dossier `dist`.
- `npm run preview` : Lance un serveur web local pour prévisualiser le build de production.
- `npm run lint` : Analyse le code avec ESLint pour détecter les erreurs.
- `npm run test` : Lance la suite de tests avec Vitest.
- `npm run test:watch` : Lance les tests en mode interactif.

## 🌍 Environnement

Pour se connecter à l'API Backend, vous devez configurer vos variables d'environnement. Créez un fichier `.env.local` à la racine du projet en vous basant sur le fichier d'exemple (s'il existe).

Exemple de `.env.local` :
```env
VITE_API_URL=http://localhost:3000/api
VITE_PUBLIC_URL=http://localhost:8080
# Autres clés tierces (ex: Google OAuth, Stripe, etc.)
```

---
*Conçu avec ❤️ pour simplifier le quotidien des professionnels de la beauté.*
