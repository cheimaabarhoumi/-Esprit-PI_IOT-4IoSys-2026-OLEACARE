# OleaCare Backend

Server Express.js avec MongoDB pour la plateforme IoT agricole.

## Installation

```bash
npm install
npm run dev
```

## Structure

```
src/
├── config/          # Configuration (DB, etc)
├── controllers/     # Logique des routes
├── models/          # Modèles Mongoose
├── routes/          # Définition des routes
├── services/        # Logique métier
├── middleware/      # JWT, validation, etc
├── utils/           # Utilitaires
└── index.js         # Point d'entrée
```

## APIs

Voir la documentation principale [README.md](../README.md)

## Variables d'Environnement

```bash
MONGODB_URI=mongodb://localhost:27017/oleacare
JWT_SECRET=your_secret_key
PORT=3000
```
