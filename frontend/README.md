# OleaCare Frontend - Angular

Interface utilisateur pour la plateforme OleaCare.

## Structure

```
src/
├── app/
│   ├── pages/          # Composants de pages
│   ├── components/     # Composants réutilisables
│   ├── services/       # Services API et Socket.io
│   ├── models/         # Interfaces TypeScript
│   ├── guards/         # Route guards
│   └── app.module.ts
├── assets/
└── styles/
```

## Installation et démarrage

```bash
npm install
ng serve
```

Accès: http://localhost:4200

## Pages Principales

- **Login** - Authentification
- **Dashboard Admin** - Gestion des utilisateurs et kits
- **Dashboard Farmer** - Vue des terrains et données
- **Terrain Details** - Détails et sensors du terrain
- **Predictions** - Historique des prédictions
- **Alerts** - Notifications

## Services

- AuthService - Authentification JWT
- ApiService - Communication backend
- SocketService - Temps réel avec WebSocket
