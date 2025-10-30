# Pharmacy Front - Frontend Next.js

Frontend Next.js pour l'application de gestion de pharmacie.

## 🚀 Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** pour les appels API
- **Zustand** pour la gestion d'état
- **React Hook Form** (prêt à être utilisé)
- **Lucide React** pour les icônes

## 📋 Prérequis

- Node.js 18+
- Backend Pharmacy lancé sur `http://localhost:8000`

## 🔧 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer le fichier `.env.local` :
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
pharmacy_front/
├── app/
│   ├── dashboard/
│   │   ├── admin/        # Dashboard administrateur
│   │   ├── pharmacien/    # Dashboard pharmacien
│   │   └── client/        # Dashboard client
│   ├── login/            # Page de connexion
│   ├── register/         # Page d'inscription
│   ├── produits/         # Pages produits (liste, création, édition)
│   ├── pharmacies/       # Pages pharmacies
│   ├── recherche/        # Page de recherche
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Page d'accueil (redirection)
├── components/
│   └── Navbar.tsx        # Barre de navigation
├── lib/
│   ├── api.ts            # Client API (Axios)
│   └── store.ts           # Store Zustand (authentification)
├── types/
│   └── index.ts          # Types TypeScript
└── ...
```

## 🔐 Authentification

L'application utilise des cookies HTTP-only pour l'authentification :
- Les tokens sont gérés automatiquement par le navigateur
- Pas besoin de stocker le token dans le localStorage
- Le refresh token est géré automatiquement

## 👤 Rôles utilisateur

- **Client** : Peut rechercher et consulter produits/pharmacies
- **Pharmacien** : Peut gérer les stocks de sa pharmacie
- **Admin** : Accès complet (produits, pharmacies, stocks)

## 🎨 Fonctionnalités

### ✅ Implémentées

- [x] Authentification (login, register, logout)
- [x] Gestion des rôles et permissions
- [x] Liste des produits
- [x] Liste des pharmacies
- [x] Recherche de produits avec tri par distance
- [x] Dashboards selon les rôles
- [x] Navigation responsive

### 🚧 À implémenter (optionnel)

- [ ] Formulaires de création/édition complets pour tous les entités
- [ ] Géolocalisation automatique pour la recherche
- [ ] Filtres avancés
- [ ] Pagination
- [ ] Gestion d'erreurs avancée
- [ ] Tests unitaires

## 🔗 API Backend

L'application nécessite le backend Pharmacy lancé. Assurez-vous que :
- Le backend est accessible sur l'URL configurée dans `.env.local`
- CORS est configuré pour accepter les requêtes depuis `http://localhost:3000`

## 📝 Notes

- Les cookies HTTP-only nécessitent que le backend et le frontend soient sur le même domaine en production
- En développement, vous pouvez utiliser `use_cookie=false` dans l'API pour utiliser les tokens Bearer

## 🚀 Déploiement

Pour la production :
1. Mettre à jour `NEXT_PUBLIC_API_URL` avec l'URL de votre backend
2. Build : `npm run build`
3. Start : `npm start`

## 📄 Licence

Ce projet est fourni à des fins éducatives.

