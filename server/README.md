# 🚗 BACKEND CONCESSIONNAIRES AUTOMOBILES & GARAGES - NODE.JS + EXPRESS + MYSQL

API REST complète, sécurisée et modulaire pour la gestion de **concessions automobiles (dealerships)**, **catalogue de véhicules neufs et d'occasion**, **leads & demandes d'essai**, **reprises véhicules**, **abonnements SaaS**, et **garages / SOS Dépannage 24/7**.
Prête pour un déploiement direct sur hébergement **Hostinger**, VPS, cPanel ou Cloud.

---

## 📁 Architecture des fichiers

```text
/server
├── .env.example              # Modèle des variables d'environnement
├── package.json              # Dépendances Node.js (Express, mysql2, bcryptjs, jsonwebtoken, cors)
├── server.js                 # Point d'entrée de l'API Express
├── schema.sql                # Schéma MySQL des 9 tables + données de démo automobiles
├── /config
│   └── database.js           # Pool de connexions MySQL sécurisé (mysql2/promise)
├── /controllers
│   ├── authController.js         # Inscription, connexion, JWT, rôles (dealer, salesperson, garage, user, admin)
│   ├── userController.js         # Gestion des profils utilisateurs
│   ├── dealershipController.js   # Gestion des concessions (catalogue, coordonnées, stats)
│   ├── vehicleController.js      # CRUD véhicules, recherche multi-critères, galerie photos
│   ├── leadController.js         # Demandes d'essais, offres de prix, propositions de reprise
│   ├── favoriteController.js     # Véhicules favoris des clients
│   ├── garageController.js       # Annuaire garages certifiés & SOS Dépannage 24/7
│   └── adminController.js        # Dashboard statistiques, gestion des comptes et concessions
├── /middleware
│   ├── auth.js               # Vérification JWT Bearer & contrôle RBAC
│   ├── role.js               # Filtre par rôle
│   └── errorHandler.js       # Gestion centralisée des erreurs et 404
└── /routes
    ├── auth.js               # /api/auth
    ├── dealerships.js        # /api/dealerships
    ├── vehicles.js           # /api/vehicles
    ├── leads.js              # /api/leads
    ├── favorites.js          # /api/favorites
    ├── garages.js            # /api/garages
    ├── users.js              # /api/users
    └── admin.js              # /api/admin
```

---

## 🚀 Installation & Démarrage

### 1. Installation des dépendances
```bash
cd server
npm install
```

### 2. Configuration environnement
Copiez `.env.example` en `.env` et saisissez vos identifiants de base de données MySQL :
```env
PORT=5000
DB_HOST=localhost
DB_USER=votre_utilisateur_mysql
DB_PASSWORD=votre_mot_de_passe
DB_NAME=concession_db
DB_PORT=3306
JWT_SECRET=votre_cle_secrete_ultra_securisee
```

### 3. Importer la base de données
Importez le fichier `schema.sql` via **phpMyAdmin** ou en ligne de commande :
```bash
mysql -u votre_utilisateur -p concession_db < schema.sql
```

### 4. Démarrer l'API
```bash
# Démarrage standard
npm start

# Mode développement avec auto-reload
npm run dev
```

---

## 📋 Points de terminaison (Endpoints API)

### 🔐 Authentification (`/api/auth`)
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `POST` | `/api/auth/register` | Inscription (`user`, `dealer`, `salesperson`, `garage`) | Public |
| `POST` | `/api/auth/login` | Connexion & obtention du token JWT | Public |
| `GET` | `/api/auth/me` | Profil connecté avec concession / garage rattaché | Privé |
| `PUT` | `/api/auth/profile` | Mise à jour profil ou mot de passe | Privé |

### 🏢 Concessionnaires (`/api/dealerships`)
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/api/dealerships` | Liste des concessions (filtres ville, plan) | Public |
| `GET` | `/api/dealerships/:id` | Détail d'une concession avec son stock | Public |
| `POST` | `/api/dealerships` | Créer une concession automobile | Concessionnaire / Admin |
| `PUT` | `/api/dealerships/:id` | Mettre à jour les informations | Concessionnaire / Admin |
| `DELETE`| `/api/dealerships/:id` | Supprimer une concession | Admin |

### 🏎️ Véhicules en Stock (`/api/vehicles`)
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/api/vehicles` | Liste avec filtres : `marque`, `modele`, `prix_max`, `carburant`, `transmission`, `etat`... | Public |
| `GET` | `/api/vehicles/:id` | Détail complet du véhicule avec galerie photos | Public |
| `POST` | `/api/vehicles` | Ajouter un véhicule au stock de la concession | Concessionnaire / Admin |
| `PUT` | `/api/vehicles/:id` | Mettre à jour un véhicule | Concessionnaire / Admin |
| `DELETE`| `/api/vehicles/:id` | Supprimer un véhicule du stock | Concessionnaire / Admin |

### 📩 Leads & Demandes Clients (`/api/leads`)
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `POST` | `/api/leads` | Demande d'essai routier, offre de prix, devis reprise | Public |
| `GET` | `/api/leads` | Liste des leads reçus par la concession | Concessionnaire / Admin |
| `PUT` | `/api/leads/:id/status` | Mettre à jour le statut (`nouveau`, `rdv_fixe`, `conclu`...) | Concessionnaire / Admin |

### ⭐ Favoris (`/api/favorites`)
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/api/favorites` | Liste des véhicules mis en favoris par l'utilisateur | Connecté |
| `POST` | `/api/favorites/:vehicleId` | Ajouter un véhicule aux favoris | Connecté |
| `DELETE`| `/api/favorites/:vehicleId`| Retirer un véhicule des favoris | Connecté |
| `GET` | `/api/favorites/check/:vehicleId` | Vérifier si un véhicule est favori | Connecté |

### 🔧 Garages & SOS Dépannage (`/api/garages`)
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/api/garages` | Annuaire des garages (filtres commune, 24/7) | Public |
| `GET` | `/api/garages/:id` | Fiche détaillée d'un garage | Public |
| `POST` | `/api/garages` | Enregistrer un nouveau garage | Professionnel / Admin |
| `POST` | `/api/garages/sos-breakdown` | Déclencher une assistance SOS Dépannage | Public |
| `GET` | `/api/garages/sos-breakdown/list` | Liste des demandes d'intervention | Connecté |
| `PUT` | `/api/garages/sos-breakdown/:id/status` | Statut de l'intervention | Connecté |

### 📊 Administration (`/api/admin`)
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/api/admin/stats` | KPI globaux (véhicules, concessions, leads, garages) | Admin |
| `GET` | `/api/admin/users` | Gestion des utilisateurs et rôles | Admin |
| `PUT` | `/api/admin/users/:id/role` | Modification du rôle d'un utilisateur | Admin |
| `DELETE`| `/api/admin/users/:id` | Suppression d'un utilisateur | Admin |
