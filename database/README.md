# 🚗 CONGOCAR - Documentation Architecture Base de Données MySQL

Base de données relationnelle conçue pour **CONGOCAR**, la plateforme automobile multi-concessions et réseau SOS Dépannage en République Démocratique du Congo (Kinshasa, Lubumbashi, Goma, Kolwezi, Matadi).

---

## 1. Caractéristiques Techniques

| Paramètre | Valeur |
| :--- | :--- |
| **SGBD Supporté** | MySQL 8.0+, MySQL 5.7, MariaDB 10.4+ |
| **Moteur de Stockage** | `InnoDB` (Transactions ACID, verrous au niveau ligne, clés étrangères) |
| **Jeu de Caractères** | `utf8mb4` (Support multilingue complet, accents français et émojis) |
| **Collation** | `utf8mb4_unicode_ci` (Recherche insensible à la casse et aux accents) |
| **Nom par défaut** | `congocar_db` |
| **Fichiers SQL** | `/server/schema.sql` et `/database/congocar_schema.sql` |

---

## 2. Dictionnaire des Tables

La base comprend au minimum les 14 tables exigées, complétées par des tables d'extension SaaS et de traçabilité :

### 1. `users` (Utilisateurs de la plateforme)
- **Rôles** : `client` (acheteur), `dealer` (gérant de concession), `dealer_sales` (commercial showroom), `garage` (atelier / dépanneur), `admin`, `superadmin`.
- **Clés & Contraintes** :
  - `PRIMARY KEY (id)` (`BIGINT UNSIGNED AUTO_INCREMENT`)
  - `UNIQUE KEY (uuid)` (UUID v4 pour l'exposition aux APIs externes)
  - `UNIQUE KEY (email)`
  - `UNIQUE KEY (phone)`
- **Timestamps** : `created_at`, `updated_at`, `deleted_at` (Soft Delete), `email_verified_at`, `phone_verified_at`, `last_login_at`.
- **Indexes** : `idx_users_email`, `idx_users_phone`, `idx_users_role`, `idx_users_status`, `idx_users_deleted_at`.

### 2. `subscription_plans` (Grille tarifaire SaaS)
- **Rôles** : Définition dynamique des forfaits Concessionnaires (`starter`, `pro`, `enterprise`) et Garages (`garage_pro`).
- **Plafonds gérés** : Quota de véhicules en ligne, nombre de mises en vedette (featured boosts), accès CRM leads, badge vérifié.
- **Tarifs bidevises** : Montant en `USD` et en `CDF` (Francs congolais).

### 3. `dealers` (Concessions Automobiles & Showrooms)
- **Champs clés** : `nom`, `slug` (URL SEO-friendly), `dealership_type` (franchise, importateur, parc occasion), `rccm`, `id_nat`, `nif`, `telephone`, `whatsapp`, `commune`, `ville`, `horaires`, `logo_url`, `banner_url`, `verified`.
- **Clés Étrangères** :
  - `fk_dealers_user_id` : Référence `users(id)` `ON DELETE SET NULL`.
- **Indexes** : `idx_dealers_slug` (UNIQUE), `idx_dealers_ville_commune`, `idx_dealers_verified`, `idx_dealers_statut`.

### 4. `garages` (Ateliers de Mécanique, Électricité & SOS Dépannage 24/7)
- **Spécialités** : Stockées en JSON (`["Mecanique_Generale", "Diagnostic_Electronique", "Depannage_Urgence_24h", "Boite_Automatique"]`).
- **Capacités** : `is_open_24h`, `has_towing_truck` (dépanneuse/remorquage), `has_mobile_mechanic` (dépannage sur route).
- **Clés Étrangères** : `fk_garages_user_id` référence `users(id)`.
- **Indexes** : `idx_garages_commune`, `idx_garages_24h`, `idx_garages_towing`, `idx_garages_rating`.

### 5. `brands` (Constructeurs / Marques Automobiles)
- **Champs** : `name` (ex: Toyota, Mercedes-Benz, BMW, Hyundai, Nissan), `slug`, `logo_url`, `country_origin`, `is_popular`, `display_order`.
- **Contraintes** : `UNIQUE (name)`, `UNIQUE (slug)`.
- **Index** : `idx_brands_popular` (`is_popular`, `display_order`, `name`).

### 6. `models` (Modèles de Véhicules)
- **Champs** : `name` (ex: Land Cruiser Prado, Hilux, Classe G, Tucson), `slug`, `default_body_type` (SUV, Berline, Pick-up, etc.).
- **Clés Étrangères** : `fk_models_brand_id` référence `brands(id)` `ON DELETE CASCADE`.
- **Contrainte d'Unicité** : `UNIQUE KEY (brand_id, slug)` (évite les doublons de modèle par marque).

### 7. `vehicles` (Stock Automobile en Vente ou Location)
- **Caractéristiques complètes** : Marque, modèle, finition, année, prix, devise (`USD`/`CDF`), promo, kilométrage, carburant, transmission, motrice (4x4, AWD, etc.), carrosserie, état (`neuf`, `occasion_kinshasa`, `occasion_importee`), puissance ch, garantie, statut douane (`dedouane_kinshasa`), équipements (JSON).
- **Clés Étrangères** :
  - `fk_vehicles_dealer_id` : Référence `dealers(id)` `ON DELETE CASCADE`.
  - `fk_vehicles_user_id` : Référence `users(id)` `ON DELETE SET NULL`.
  - `fk_vehicles_brand_id` : Référence `brands(id)` `ON DELETE SET NULL`.
  - `fk_vehicles_model_id` : Référence `models(id)` `ON DELETE SET NULL`.
- **Indexes Optimisés pour le Catalogue** :
  - B-Tree : `idx_vehicles_marque_modele`, `idx_vehicles_prix`, `idx_vehicles_annee`, `idx_vehicles_km`, `idx_vehicles_carburant`, `idx_vehicles_transmission`, `idx_vehicles_categorie`, `idx_vehicles_status`, `idx_vehicles_ville_commune`, `idx_vehicles_en_vedette`.
  - Full-Text : `FULLTEXT idx_vehicles_search (marque, modele, finition, description)` pour moteur de recherche ultra-rapide.

### 8. `vehicle_images` (Photos HD & Visuels 360)
- **Champs** : `image_url`, `thumbnail_url`, `is_primary` (photo de couverture), `is_360`, `display_order`.
- **Clé Étrangère** : `fk_vehicle_images_vehicle_id` référence `vehicles(id)` `ON DELETE CASCADE`.
- **Index** : `idx_v_images_vehicle (vehicle_id, is_primary, display_order)`.

### 9. `favorites` (Véhicules mis en favoris par les clients)
- **Champs** : `user_id`, `vehicle_id`, `created_at`.
- **Contrainte d'Unicité** : `UNIQUE KEY (user_id, vehicle_id)` (un acheteur ne peut liker 2 fois le même véhicule).
- **Triggers d'intégrité** :
  - Incrémente automatiquement `vehicles.favorites_count` à l'insertion.
  - Décrémente automatiquement `vehicles.favorites_count` à la suppression.

### 10. `messages` (Chat & Messagerie Directe Acheteur / Concessionnaire)
- **Champs** : `conversation_id`, `sender_id`, `receiver_id`, `vehicle_id`, `message_text`, `attachment_url`, `attachment_type`, `is_read`, `read_at`.
- **Clés Étrangères** :
  - `fk_messages_sender_id` référence `users(id)` `ON DELETE CASCADE`.
  - `fk_messages_receiver_id` référence `users(id)` `ON DELETE CASCADE`.
  - `fk_messages_vehicle_id` référence `vehicles(id)` `ON DELETE SET NULL`.
- **Indexes** : `idx_messages_conversation (conversation_id, created_at)`, `idx_messages_receiver_read (receiver_id, is_read)`.

### 11. `contact_requests` (Demandes d'Essai, Devis, Reprise, SOS)
- **Types de demandes** : `essai` (test drive), `information`, `offre_reprise` (trade-in avec détails JSON), `financement`, `offre_prix`, `sos_depannage`, `rdv_garage`.
- **Clés Étrangères** :
  - `fk_cr_dealership_id` référence `dealers(id)` `ON DELETE CASCADE`.
  - `fk_cr_garage_id` référence `garages(id)` `ON DELETE CASCADE`.
  - `fk_cr_vehicle_id` référence `vehicles(id)` `ON DELETE SET NULL`.
  - `fk_cr_user_id` référence `users(id)` `ON DELETE SET NULL`.

### 12. `reports` (Modération & Anti-Fraude)
- **Motifs** : Arnaque / fraude, véhicule déjà vendu, prix incorrect, faux kilométrage, véhicule volé, doublon, contenu inapproprié.
- **Workflow** : `pending` -> `in_review` -> `action_taken` / `dismissed` avec journalisation de l'administrateur modérateur.

### 13. `notifications` (Système d'Alertes Multi-Canal In-App)
- **Usage** : Nouveaux leads pour un concessionnaire, alerte baisse de prix sur véhicule favori, échéance d'abonnement.
- **Index** : `idx_notif_user_read (user_id, is_read, created_at)`.

### 14. `subscriptions` (Gestion des Abonnements SaaS Concessions & Garages)
- **Périodicité** : Mensuelle, trimestrielle ou annuelle.
- **Champs** : `plan_id`, `dealer_id`, `garage_id`, `status` (`trialing`, `active`, `past_due`, `canceled`, `expired`), dates `current_period_start` et `current_period_end`.
- **Clés Étrangères** : Références `subscription_plans(id)`, `dealers(id)` et `garages(id)`.

### 15. `payments` (Transactions Financières & Mobile Money RDC)
- **Moyens de paiement intégrés** : M-Pesa (Vodacom), Orange Money, Airtel Money, AfriMoney, Visa/MasterCard, Virement bancaire, Espèces en agence.
- **Devises** : `USD` et `CDF` avec historisation du taux de change appliqué (`exchange_rate`).
- **Objet** : Abonnement SaaS concession, boost mise en avant d'un véhicule (`vehicle_featured_boost`), badge vérifié, frais dépannage SOS.

### 16. `reviews` (Avis Clients Vérifiés)
- Évaluations de 1 à 5 étoiles sur les concessions et garages, avec modération avant publication.

### 17. `audit_logs` (Sécurité & Conformité)
- Journalise les actions critiques (création de compte, modification de prix, bannissement de concession, suppression d'annonce).

---

## 3. Vues Optimisées (High-Performance Views)

1. **`v_active_vehicles`** : Vue consolidée joignant les véhicules disponibles, leurs concessions respectives (téléphone, whatsapp, logo) et leur photo principale. Réduit drastiquement le nombre de requêtes SQL sur la page catalogue d'accueil.
2. **`dealerships`**, **`vehicle_favorites`**, **`leads`** : Vues de compatibilité ascendante garantissant que les endpoints d'anciennes versions continuent de fonctionner sans interruption.

---

## 4. Guide de Déploiement & Importation

### Option A : En ligne de commande (CLI / VPS / Docker)
```bash
# Se connecter à MySQL et créer la base
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS congocar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importer le schéma complet avec ses index et seeds
mysql -u root -p congocar_db < server/schema.sql
```

### Option B : Via phpMyAdmin (Hostinger / cPanel)
1. Rendez-vous sur votre panneau **cPanel** ou **hPanel Hostinger**.
2. Allez dans **Bases de données MySQL** et créez la base `congocar_db`.
3. Ouvrez **phpMyAdmin**, sélectionnez votre base dans le menu latéral gauche.
4. Cliquez sur l'onglet **Importer**, sélectionnez le fichier `server/schema.sql` (ou `database/congocar_schema.sql`).
5. Cliquez sur **Exécuter**. Toutes les 17 tables, vues, déclencheurs et données de démonstration seront créés instantanément.

---

## 5. Architecture Évolutive (Scalability Roadmap)

Pour accompagner la croissance de **CONGOCAR** vers des millions d'utilisateurs et de véhicules :

1. **Partitionnement Horizontal (Table Partitioning)** :
   - Partitionner la table `vehicles` par tranche de statuts ou par région/ville (`PARTITION BY LIST COLUMNS(ville)`).
   - Partitionner `payments` et `audit_logs` par plage d'années (`PARTITION BY RANGE (YEAR(created_at))`).
2. **Réplicas de Lecture (Read-Replicas)** :
   - Séparer les lectures (catalogue public, recherche de voitures) sur des répliques MySQL Read-Only en lecture seule, et réserver le nœud Primary (Master) aux écritures (nouveaux véhicules, leads, paiements).
3. **Mise en cache Redis** :
   - Mettre en cache les résultats des requêtes fréquentes (`brands`, `models`, fiches de véhicules vedettes, top concessions) pendant 10 à 30 minutes avec invalidation sur événement de mise à jour.
4. **Stockage d'Images sur Object Storage / CDN** :
   - Les URLs dans `vehicle_images` pointent vers un bucket Cloud Storage ou S3 avec CDN Cloudflare/Fastly pour un affichage instantané à Kinshasa même sur connexions mobiles 3G/4G.
