-- ====================================================================
-- 🚗 CONGOCAR - BASE DE DONNÉES MYSQL OFFICIELLE & ARCHITECTURE SCALABLE
-- Plateforme Automobile, Réseau Multi-Concessions & SOS Dépannage en RDC
-- Compatible : MySQL 8.0+, MySQL 5.7, MariaDB 10.4+ (Hostinger / cPanel / Cloud)
-- Encodage   : utf8mb4 / utf8mb4_unicode_ci (support accents & emojis)
-- Moteur     : InnoDB (Transactions ACID, Intégrité référentielle, Clés étrangères)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `congocar_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `congocar_db`;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ====================================================================
-- 1. TABLE : USERS (Utilisateurs, Clients, Concessionnaires, Garagistes, Admins)
-- ====================================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashé (jamais en clair)',
  `role` ENUM('admin', 'dealer', 'seller', 'garage', 'user', 'client', 'dealer_sales', 'superadmin') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'suspended', 'pending_verification') NOT NULL DEFAULT 'active',
  `avatar` VARCHAR(1000) DEFAULT NULL,
  `preferred_currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `city` VARCHAR(100) DEFAULT 'Kinshasa',
  `address` VARCHAR(255) DEFAULT NULL,
  `reset_password_token` VARCHAR(255) DEFAULT NULL,
  `reset_password_expires` TIMESTAMP NULL DEFAULT NULL,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `phone_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_phone` (`phone`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`),
  INDEX `idx_users_deleted_at` (`deleted_at`),
  INDEX `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 1.1 TABLE : PASSWORD_RESETS (Récupération et réinitialisation de mot de passe)
-- ====================================================================
DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pwd_resets_email` (`email`),
  INDEX `idx_pwd_resets_code` (`code`),
  INDEX `idx_pwd_resets_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 2. TABLE : SUBSCRIPTION_PLANS (Grille Tarifaire des Abonnements SaaS)
-- ====================================================================
DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE `subscription_plans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `target_type` ENUM('dealer', 'garage', 'both') NOT NULL DEFAULT 'dealer',
  `price_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `price_cdf` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `billing_cycle` ENUM('monthly', 'quarterly', 'yearly') NOT NULL DEFAULT 'monthly',
  `trial_days` SMALLINT UNSIGNED NOT NULL DEFAULT 14,
  `max_vehicles` INT UNSIGNED NOT NULL DEFAULT 10,
  `max_featured_vehicles` INT UNSIGNED NOT NULL DEFAULT 2,
  `has_crm_leads` BOOLEAN NOT NULL DEFAULT TRUE,
  `has_whatsapp_direct` BOOLEAN NOT NULL DEFAULT TRUE,
  `has_analytics` BOOLEAN NOT NULL DEFAULT TRUE,
  `has_verified_badge` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_priority_support` BOOLEAN NOT NULL DEFAULT FALSE,
  `features` JSON DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_sub_plans_code` (`code`),
  INDEX `idx_sub_plans_active` (`is_active`, `target_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 3. TABLE : DEALERS (Concessions Automobiles & Showrooms en RDC)
-- ====================================================================
DROP TABLE IF EXISTS `dealers`;
CREATE TABLE `dealers` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) GENERATED ALWAYS AS (`nom`) STORED,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `dealership_type` ENUM('franchise_officielle', 'independant', 'importateur', 'parc_occasion') NOT NULL DEFAULT 'independant',
  `slogan` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `rccm` VARCHAR(100) DEFAULT NULL,
  `id_nat` VARCHAR(100) DEFAULT NULL,
  `nif` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `telephone` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(50) GENERATED ALWAYS AS (`telephone`) STORED,
  `whatsapp` VARCHAR(50) DEFAULT NULL,
  `site_web` VARCHAR(255) DEFAULT NULL,
  `website` VARCHAR(255) GENERATED ALWAYS AS (`site_web`) STORED,
  `adresse` VARCHAR(255) DEFAULT NULL,
  `address` VARCHAR(255) GENERATED ALWAYS AS (`adresse`) STORED,
  `commune` VARCHAR(100) NOT NULL DEFAULT 'Gombe',
  `ville` VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
  `city` VARCHAR(100) GENERATED ALWAYS AS (`ville`) STORED,
  `province` VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
  `pays` VARCHAR(50) NOT NULL DEFAULT 'RDC',
  `latitude` DECIMAL(10, 8) DEFAULT NULL,
  `longitude` DECIMAL(11, 8) DEFAULT NULL,
  `horaires` VARCHAR(255) DEFAULT 'Lun - Sam : 08h00 - 18h00',
  `logo_url` VARCHAR(1000) DEFAULT NULL,
  `banner_url` VARCHAR(1000) DEFAULT NULL,
  `verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `statut_abonnement` ENUM('essai_gratuit', 'actif', 'facture_en_attente', 'suspendu', 'expire') NOT NULL DEFAULT 'essai_gratuit',
  `plan_id` ENUM('starter', 'pro', 'enterprise') DEFAULT 'starter',
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  `reviews_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_vehicles_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_dealers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_dealers_slug` (`slug`),
  INDEX `idx_dealers_ville_commune` (`ville`, `commune`),
  INDEX `idx_dealers_verified` (`verified`),
  INDEX `idx_dealers_statut` (`statut_abonnement`),
  INDEX `idx_dealers_user` (`user_id`),
  INDEX `idx_dealers_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 4. TABLE : GARAGES (Ateliers Mécaniques, Centres Auto & SOS Dépannage 24/7)
-- ====================================================================
DROP TABLE IF EXISTS `garages`;
CREATE TABLE `garages` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) GENERATED ALWAYS AS (`nom`) STORED,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `commune` VARCHAR(100) NOT NULL,
  `ville` VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
  `city` VARCHAR(100) GENERATED ALWAYS AS (`ville`) STORED,
  `province` VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
  `adresse` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) GENERATED ALWAYS AS (`adresse`) STORED,
  `telephone` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(50) GENERATED ALWAYS AS (`telephone`) STORED,
  `whatsapp` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `latitude` DECIMAL(10, 8) DEFAULT NULL,
  `longitude` DECIMAL(11, 8) DEFAULT NULL,
  `horaires` VARCHAR(255) DEFAULT 'Lun - Sam : 08h00 - 18h00',
  `is_open_24h` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_towing_truck` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_mobile_mechanic` BOOLEAN NOT NULL DEFAULT FALSE,
  `specialties` JSON DEFAULT NULL,
  `photo_url` VARCHAR(1000) DEFAULT NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  `total_reviews` INT UNSIGNED NOT NULL DEFAULT 0,
  `verified` BOOLEAN NOT NULL DEFAULT TRUE,
  `statut_abonnement` ENUM('actif', 'essai_gratuit', 'suspendu') NOT NULL DEFAULT 'actif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_garages_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_garages_slug` (`slug`),
  INDEX `idx_garages_commune` (`commune`),
  INDEX `idx_garages_ville` (`ville`),
  INDEX `idx_garages_24h` (`is_open_24h`),
  INDEX `idx_garages_towing` (`has_towing_truck`),
  INDEX `idx_garages_verified` (`verified`),
  INDEX `idx_garages_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 5. TABLE : BRANDS (Constructeurs Automobiles : Toyota, Mercedes, etc.)
-- ====================================================================
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `logo_url` VARCHAR(1000) DEFAULT NULL,
  `country_origin` VARCHAR(100) DEFAULT NULL,
  `is_popular` BOOLEAN NOT NULL DEFAULT FALSE,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `vehicles_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_brands_slug` (`slug`),
  INDEX `idx_brands_popular` (`is_popular`, `display_order`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 6. TABLE : MODELS (Modèles associés aux Marques : Land Cruiser, Hilux, etc.)
-- ====================================================================
DROP TABLE IF EXISTS `models`;
CREATE TABLE `models` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `brand_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `default_body_type` ENUM('SUV', 'Berline', 'Citadine', 'Coupé', 'Cabriolet', 'Break', 'Pick-up', 'Utilitaire', 'Minibus') NOT NULL DEFAULT 'Berline',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_models_brand_id` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_brand_model_slug` (`brand_id`, `slug`),
  INDEX `idx_models_brand_id` (`brand_id`),
  INDEX `idx_models_name` (`name`),
  INDEX `idx_models_body_type` (`default_body_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 7. TABLE : VEHICLES (Parc & Stock de Véhicules en Vente/Location)
-- ====================================================================
DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `dealership_id` BIGINT UNSIGNED DEFAULT NULL,
  `dealer_id` BIGINT UNSIGNED GENERATED ALWAYS AS (`dealership_id`) STORED,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `brand_id` INT UNSIGNED DEFAULT NULL,
  `model_id` INT UNSIGNED DEFAULT NULL,
  `marque` VARCHAR(100) NOT NULL,
  `modele` VARCHAR(100) NOT NULL,
  `finition` VARCHAR(150) DEFAULT '',
  `annee` SMALLINT UNSIGNED NOT NULL,
  `prix` DECIMAL(12, 2) NOT NULL,
  `currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `msrp` DECIMAL(12, 2) DEFAULT NULL,
  `remise_instantanee` DECIMAL(12, 2) DEFAULT 0.00,
  `ancien_prix` DECIMAL(12, 2) DEFAULT NULL,
  `en_promo` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_negotiable` BOOLEAN NOT NULL DEFAULT TRUE,
  `kilometrage` INT UNSIGNED NOT NULL DEFAULT 0,
  `carburant` ENUM('Essence', 'Diesel', 'Hybride', 'Hybride_Rechargeable', 'Électrique', 'GPL') NOT NULL DEFAULT 'Essence',
  `transmission` ENUM('Automatique', 'Manuelle', 'Sequentielle') NOT NULL DEFAULT 'Automatique',
  `motrice` VARCHAR(50) NOT NULL DEFAULT '4x4',
  `categorie` ENUM('SUV', 'Berline', 'Citadine', 'Coupé', 'Cabriolet', 'Break', 'Pick-up', 'Utilitaire', 'Minibus') NOT NULL DEFAULT 'SUV',
  `etat` ENUM('neuf', 'occasion', 'occasion_kinshasa', 'occasion_importee') NOT NULL DEFAULT 'occasion',
  `status` ENUM('disponible', 'reserve', 'vendu', 'en_arrivage', 'archive') NOT NULL DEFAULT 'disponible',
  `puissance_ch` SMALLINT UNSIGNED DEFAULT 0,
  `puissance_fiscale` TINYINT UNSIGNED DEFAULT 0,
  `couleur` VARCHAR(50) DEFAULT 'Noir',
  `couleur_interieure` VARCHAR(50) DEFAULT NULL,
  `moteur` VARCHAR(100) DEFAULT NULL,
  `portes` TINYINT UNSIGNED DEFAULT 5,
  `places` TINYINT UNSIGNED DEFAULT 5,
  `co2_gkm` SMALLINT UNSIGNED DEFAULT 0,
  `garantie_mois` SMALLINT UNSIGNED DEFAULT 12,
  `vin` VARCHAR(50) DEFAULT NULL,
  `plaque_immatriculation` VARCHAR(50) DEFAULT NULL,
  `statut_douane` ENUM('dedouane_kinshasa', 'en_douane', 'importation_directe') DEFAULT 'dedouane_kinshasa',
  `ville` VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
  `commune` VARCHAR(100) DEFAULT 'Gombe',
  `description` TEXT DEFAULT NULL,
  `equipements` JSON DEFAULT NULL,
  `en_vedette` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_featured` BOOLEAN GENERATED ALWAYS AS (`en_vedette`) STORED,
  `featured_until` DATETIME DEFAULT NULL,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `favorites_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `leads_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_vehicles_dealer_id` FOREIGN KEY (`dealership_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vehicles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vehicles_brand_id` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vehicles_model_id` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`) ON DELETE SET NULL,
  INDEX `idx_vehicles_marque_modele` (`marque`, `modele`),
  INDEX `idx_vehicles_prix` (`prix`, `currency`),
  INDEX `idx_vehicles_annee` (`annee`),
  INDEX `idx_vehicles_km` (`kilometrage`),
  INDEX `idx_vehicles_carburant` (`carburant`),
  INDEX `idx_vehicles_transmission` (`transmission`),
  INDEX `idx_vehicles_categorie` (`categorie`),
  INDEX `idx_vehicles_etat` (`etat`),
  INDEX `idx_vehicles_status` (`status`),
  INDEX `idx_vehicles_ville_commune` (`ville`, `commune`),
  INDEX `idx_vehicles_dealer_status` (`dealership_id`, `status`),
  INDEX `idx_vehicles_en_vedette` (`en_vedette`),
  INDEX `idx_vehicles_created_at` (`created_at`),
  INDEX `idx_vehicles_deleted_at` (`deleted_at`),
  FULLTEXT `idx_vehicles_search` (`marque`, `modele`, `finition`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 8. TABLE : VEHICLE_IMAGES (Galerie Photos HD & Vue 360 des Véhicules)
-- ====================================================================
DROP TABLE IF EXISTS `vehicle_images`;
CREATE TABLE `vehicle_images` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `vehicle_id` BIGINT UNSIGNED NOT NULL,
  `image_url` VARCHAR(1000) NOT NULL,
  `thumbnail_url` VARCHAR(1000) DEFAULT NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_360` BOOLEAN NOT NULL DEFAULT FALSE,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `caption` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_vehicle_images_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  INDEX `idx_v_images_vehicle` (`vehicle_id`, `is_primary`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 9. TABLE : FAVORITES (Véhicules Favoris & Sauvegardés par les Clients)
-- ====================================================================
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `vehicle_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_favorites_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_vehicle_fav` (`user_id`, `vehicle_id`),
  INDEX `idx_favorites_user` (`user_id`, `created_at`),
  INDEX `idx_favorites_vehicle` (`vehicle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 10. TABLE : MESSAGES (Messagerie Interne / Chat Direct Acheteur-Vendeur)
-- ====================================================================
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` VARCHAR(64) NOT NULL,
  `sender_id` BIGINT UNSIGNED NOT NULL,
  `receiver_id` BIGINT UNSIGNED NOT NULL,
  `vehicle_id` BIGINT UNSIGNED DEFAULT NULL,
  `message_text` TEXT NOT NULL,
  `attachment_url` VARCHAR(1000) DEFAULT NULL,
  `attachment_type` ENUM('image', 'document', 'pdf', 'audio') DEFAULT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_messages_sender_id` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_receiver_id` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  INDEX `idx_messages_conversation` (`conversation_id`, `created_at`),
  INDEX `idx_messages_receiver_read` (`receiver_id`, `is_read`),
  INDEX `idx_messages_sender` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 11. TABLE : CONTACT_REQUESTS (Demandes Clients : Essai, Devis, Reprise, SOS)
-- ====================================================================
DROP TABLE IF EXISTS `contact_requests`;
CREATE TABLE `contact_requests` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `dealership_id` BIGINT UNSIGNED DEFAULT NULL,
  `dealer_id` BIGINT UNSIGNED GENERATED ALWAYS AS (`dealership_id`) STORED,
  `garage_id` BIGINT UNSIGNED DEFAULT NULL,
  `vehicle_id` BIGINT UNSIGNED DEFAULT NULL,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `vehicle_title` VARCHAR(255) DEFAULT NULL,
  `vehicle_price` DECIMAL(12, 2) DEFAULT 0.00,
  `nom_client` VARCHAR(255) NOT NULL,
  `client_name` VARCHAR(255) GENERATED ALWAYS AS (`nom_client`) STORED,
  `email` VARCHAR(191) NOT NULL,
  `telephone` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(50) GENERATED ALWAYS AS (`telephone`) STORED,
  `type_demande` ENUM('essai', 'information', 'offre_reprise', 'financement', 'offre_prix', 'sos_depannage', 'rdv_garage') NOT NULL DEFAULT 'information',
  `date_souhaitee` DATE DEFAULT NULL,
  `horaire_souhaite` VARCHAR(50) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `offre_prix_proposee` DECIMAL(12, 2) DEFAULT NULL,
  `vehicule_reprise_info` TEXT DEFAULT NULL,
  `statut` ENUM('nouveau', 'contacte', 'rdv_fixe', 'conclu', 'annule') NOT NULL DEFAULT 'nouveau',
  `status` VARCHAR(50) GENERATED ALWAYS AS (`statut`) STORED,
  `notes_admin` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cr_dealership_id` FOREIGN KEY (`dealership_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cr_garage_id` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cr_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cr_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_cr_dealer_status` (`dealership_id`, `statut`),
  INDEX `idx_cr_garage_status` (`garage_id`, `statut`),
  INDEX `idx_cr_vehicle_id` (`vehicle_id`),
  INDEX `idx_cr_type` (`type_demande`),
  INDEX `idx_cr_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 12. TABLE : REPORTS (Signalements, Modération & Anti-Fraude)
-- ====================================================================
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `reporter_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `reporter_email` VARCHAR(191) DEFAULT NULL,
  `reporter_phone` VARCHAR(50) DEFAULT NULL,
  `reported_vehicle_id` BIGINT UNSIGNED DEFAULT NULL,
  `reported_dealer_id` BIGINT UNSIGNED DEFAULT NULL,
  `reported_garage_id` BIGINT UNSIGNED DEFAULT NULL,
  `reported_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `reason` ENUM('fraud_scam', 'already_sold', 'incorrect_price', 'fake_mileage', 'stolen_vehicle', 'duplicate_ad', 'inappropriate_content', 'other') NOT NULL,
  `description` TEXT NOT NULL,
  `evidence_url` VARCHAR(1000) DEFAULT NULL,
  `status` ENUM('pending', 'in_review', 'action_taken', 'dismissed') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT DEFAULT NULL,
  `reviewed_by` BIGINT UNSIGNED DEFAULT NULL,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_vehicle` FOREIGN KEY (`reported_vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_dealer` FOREIGN KEY (`reported_dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_garage` FOREIGN KEY (`reported_garage_id`) REFERENCES `garages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_user` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_admin` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_reports_status` (`status`, `created_at`),
  INDEX `idx_reports_vehicle` (`reported_vehicle_id`),
  INDEX `idx_reports_dealer` (`reported_dealer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 13. TABLE : NOTIFICATIONS (Système d'Alertes Multi-Canal In-App)
-- ====================================================================
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `action_url` VARCHAR(500) DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notif_user_read` (`user_id`, `is_read`, `created_at`),
  INDEX `idx_notif_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 14. TABLE : SUBSCRIPTIONS (Abonnements SaaS Concessions & Garages)
-- ====================================================================
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `plan_id` INT UNSIGNED NOT NULL,
  `dealer_id` BIGINT UNSIGNED DEFAULT NULL,
  `garage_id` BIGINT UNSIGNED DEFAULT NULL,
  `status` ENUM('trialing', 'active', 'past_due', 'canceled', 'expired') NOT NULL DEFAULT 'trialing',
  `billing_cycle` ENUM('monthly', 'quarterly', 'yearly') NOT NULL DEFAULT 'monthly',
  `price_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `price_cdf` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `max_vehicles_allowed` INT UNSIGNED NOT NULL DEFAULT 10,
  `max_featured_allowed` INT UNSIGNED NOT NULL DEFAULT 2,
  `trial_ends_at` DATETIME DEFAULT NULL,
  `current_period_start` DATETIME NOT NULL,
  `current_period_end` DATETIME NOT NULL,
  `canceled_at` DATETIME DEFAULT NULL,
  `auto_renew` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_sub_plan_id` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sub_dealer_id` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_garage_id` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE CASCADE,
  INDEX `idx_sub_dealer_status` (`dealer_id`, `status`),
  INDEX `idx_sub_garage_status` (`garage_id`, `status`),
  INDEX `idx_sub_period_end` (`current_period_end`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 15. TABLE : PAYMENTS (Transactions, Mobile Money RDC & Cartes Bancaires)
-- ====================================================================
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `transaction_reference` VARCHAR(100) NOT NULL UNIQUE,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `dealer_id` BIGINT UNSIGNED DEFAULT NULL,
  `garage_id` BIGINT UNSIGNED DEFAULT NULL,
  `subscription_id` BIGINT UNSIGNED DEFAULT NULL,
  `vehicle_id` BIGINT UNSIGNED DEFAULT NULL,
  `purpose` ENUM('subscription', 'vehicle_featured_boost', 'verification_badge', 'commission', 'sos_breakdown_fee', 'other') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `exchange_rate` DECIMAL(10, 4) NOT NULL DEFAULT 2850.0000,
  `payment_method` ENUM('mpesa', 'orange_money', 'airtel_money', 'afrimoney', 'visa_mastercard', 'bank_transfer', 'cash') NOT NULL,
  `gateway` VARCHAR(50) NOT NULL DEFAULT 'maxicash',
  `gateway_reference` VARCHAR(255) DEFAULT NULL,
  `payer_phone` VARCHAR(50) DEFAULT NULL,
  `payer_name` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending', 'processing', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `receipt_url` VARCHAR(1000) DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pay_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_pay_dealer_id` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pay_garage_id` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pay_sub_id` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pay_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  INDEX `idx_pay_ref` (`transaction_reference`),
  INDEX `idx_pay_user_status` (`user_id`, `status`),
  INDEX `idx_pay_dealer_status` (`dealer_id`, `status`),
  INDEX `idx_pay_status_date` (`status`, `created_at`),
  INDEX `idx_pay_method` (`payment_method`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 16. TABLE : REVIEWS (Notes & Témoignages Acheteurs Vérifiés)
-- ====================================================================
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `dealer_id` BIGINT UNSIGNED DEFAULT NULL,
  `garage_id` BIGINT UNSIGNED DEFAULT NULL,
  `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `title` VARCHAR(255) DEFAULT NULL,
  `comment` TEXT NOT NULL,
  `is_approved` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_dealer_id` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_garage_id` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE CASCADE,
  INDEX `idx_reviews_dealer` (`dealer_id`, `is_approved`),
  INDEX `idx_reviews_garage` (`garage_id`, `is_approved`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 17. TABLE : AUDIT_LOGS (Traçabilité & Historique d'Audit Sécurisé)
-- ====================================================================
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` BIGINT UNSIGNED DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `old_values` JSON DEFAULT NULL,
  `new_values` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
  INDEX `idx_audit_user` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- VUES DE RÉTROCOMPATIBILITÉ ET OPTIMISATION (HIGH PERFORMANCE VIEWS)
-- ====================================================================
CREATE OR REPLACE VIEW `dealerships` AS SELECT * FROM `dealers`;
CREATE OR REPLACE VIEW `vehicle_favorites` AS SELECT * FROM `favorites`;
CREATE OR REPLACE VIEW `leads` AS SELECT * FROM `contact_requests`;

CREATE OR REPLACE VIEW `v_active_vehicles` AS
SELECT 
  v.id,
  v.uuid,
  v.dealership_id,
  v.marque,
  v.modele,
  v.finition,
  v.annee,
  v.prix,
  v.currency,
  v.ancien_prix,
  v.remise_instantanee,
  v.en_promo,
  v.kilometrage,
  v.carburant,
  v.transmission,
  v.motrice,
  v.categorie,
  v.etat,
  v.puissance_ch,
  v.couleur,
  v.ville,
  v.commune,
  v.description,
  v.equipements,
  v.en_vedette,
  v.views_count,
  v.favorites_count,
  v.leads_count,
  v.created_at,
  d.nom AS concession_nom,
  d.telephone AS concession_telephone,
  d.whatsapp AS concession_whatsapp,
  d.logo_url AS concession_logo,
  d.verified AS concession_verifiee,
  (
    SELECT vi.image_url 
    FROM `vehicle_images` vi 
    WHERE vi.vehicle_id = v.id 
    ORDER BY vi.is_primary DESC, vi.display_order ASC 
    LIMIT 1
  ) AS primary_image
FROM `vehicles` v
LEFT JOIN `dealers` d ON v.dealership_id = d.id
WHERE v.status = 'disponible' AND v.deleted_at IS NULL;

-- ====================================================================
-- DÉCLENCHEURS (TRIGGERS)
-- ====================================================================
DELIMITER $$

CREATE TRIGGER `trg_favorite_added` AFTER INSERT ON `favorites`
FOR EACH ROW
BEGIN
  UPDATE `vehicles` SET `favorites_count` = `favorites_count` + 1 WHERE `id` = NEW.vehicle_id;
END$$

CREATE TRIGGER `trg_favorite_removed` AFTER DELETE ON `favorites`
FOR EACH ROW
BEGIN
  UPDATE `vehicles` SET `favorites_count` = GREATEST(0, `favorites_count` - 1) WHERE `id` = OLD.vehicle_id;
END$$

CREATE TRIGGER `trg_lead_added` AFTER INSERT ON `contact_requests`
FOR EACH ROW
BEGIN
  IF NEW.vehicle_id IS NOT NULL THEN
    UPDATE `vehicles` SET `leads_count` = `leads_count` + 1 WHERE `id` = NEW.vehicle_id;
  END IF;
END$$

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
