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

-- Désactivation temporaire des contraintes de clés pour la création propre des tables
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
-- 3. TABLE : DEALERS (Concessionnaires Automobiles & Showrooms en RDC)
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
  `listing_tier` ENUM('free', 'premium', 'featured') NOT NULL DEFAULT 'free',
  `visibility_badge` ENUM('urgent', 'certifie', 'promo', 'top_deal', 'garantie_incluse') DEFAULT NULL,
  `boost_top_search` BOOLEAN NOT NULL DEFAULT FALSE,
  `boost_top_search_until` DATETIME DEFAULT NULL,
  `boost_homepage` BOOLEAN NOT NULL DEFAULT FALSE,
  `boost_homepage_until` DATETIME DEFAULT NULL,
  `is_sponsored` BOOLEAN NOT NULL DEFAULT FALSE,
  `sponsor_name` VARCHAR(150) DEFAULT NULL,
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
  INDEX `idx_vehicles_listing_tier` (`listing_tier`),
  INDEX `idx_vehicles_boost_search` (`boost_top_search`),
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
  `purpose` ENUM('subscription', 'vehicle_promotion', 'vehicle_featured_boost', 'verification_badge', 'ad_campaign', 'commission', 'sos_breakdown_fee', 'other') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `exchange_rate` DECIMAL(10, 4) NOT NULL DEFAULT 2850.0000,
  `payment_method` ENUM('mpesa', 'orange_money', 'airtel_money', 'afrimoney', 'visa_mastercard', 'bank_transfer', 'cash') NOT NULL,
  `gateway` VARCHAR(50) NOT NULL DEFAULT 'maxicash',
  `gateway_reference` VARCHAR(255) DEFAULT NULL,
  `payer_phone` VARCHAR(50) DEFAULT NULL,
  `payer_name` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled', 'expired') NOT NULL DEFAULT 'PENDING',
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
-- 18. TABLE : MONETIZATION_ORDERS (Commandes de Forfaits, Boosts & Abonnements)
-- ====================================================================
DROP TABLE IF EXISTS `monetization_orders`;
CREATE TABLE `monetization_orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `type` ENUM('listing_tier', 'visibility_boost', 'dealership_subscription', 'garage_subscription', 'ad_campaign') NOT NULL,
  `item_id` VARCHAR(100) NOT NULL,
  `item_nom` VARCHAR(255) NOT NULL,
  `target_vehicle_id` BIGINT UNSIGNED DEFAULT NULL,
  `dealership_id` BIGINT UNSIGNED DEFAULT NULL,
  `garage_id` BIGINT UNSIGNED DEFAULT NULL,
  `client_nom` VARCHAR(255) NOT NULL,
  `client_phone` VARCHAR(50) NOT NULL,
  `client_email` VARCHAR(191) DEFAULT NULL,
  `montant_usd` DECIMAL(12, 2) NOT NULL,
  `devise` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `payment_method` ENUM('mpesa', 'orange_money', 'airtel_money', 'afrimoney', 'visa_mastercard', 'virement', 'cash') NOT NULL DEFAULT 'mpesa',
  `payment_reference` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('pending', 'completed', 'cancelled', 'failed') NOT NULL DEFAULT 'pending',
  `metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_mord_vehicle_id` FOREIGN KEY (`target_vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mord_dealer_id` FOREIGN KEY (`dealership_id`) REFERENCES `dealers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mord_garage_id` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE SET NULL,
  INDEX `idx_mord_type` (`type`),
  INDEX `idx_mord_status` (`status`),
  INDEX `idx_mord_vehicle` (`target_vehicle_id`),
  INDEX `idx_mord_dealer` (`dealership_id`),
  INDEX `idx_mord_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 19. TABLE : AD_CAMPAIGNS (Régie Publicitaire & Bannières Partenaires)
-- ====================================================================
DROP TABLE IF EXISTS `ad_campaigns`;
CREATE TABLE `ad_campaigns` (
  `id` VARCHAR(64) PRIMARY KEY,
  `titre` VARCHAR(255) NOT NULL,
  `nom_entreprise` VARCHAR(255) DEFAULT NULL,
  `annonceur` VARCHAR(255) NOT NULL,
  `tag` VARCHAR(100) DEFAULT 'Partenaire Officiel',
  `format` ENUM('banner_leaderboard', 'banner_inline', 'sidebar_box', 'banner_sos') NOT NULL DEFAULT 'banner_inline',
  `emplacement` VARCHAR(100) NOT NULL DEFAULT 'homepage',
  `image_url` VARCHAR(1000) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `lien` VARCHAR(500) DEFAULT '#',
  `cta_text` VARCHAR(100) DEFAULT 'En savoir plus',
  `cta_url` VARCHAR(500) DEFAULT '#',
  `badge_color` VARCHAR(100) DEFAULT 'bg-blue-600 text-white',
  `budget` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `statut` ENUM('active', 'pending', 'paused', 'expired') NOT NULL DEFAULT 'active',
  `impressions` INT UNSIGNED NOT NULL DEFAULT 0,
  `clics` INT UNSIGNED NOT NULL DEFAULT 0,
  `date_debut` DATE DEFAULT NULL,
  `date_fin` DATE DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ads_active_emplacement` (`is_active`, `emplacement`),
  INDEX `idx_ads_statut` (`statut`),
  INDEX `idx_ads_format` (`format`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 20. TABLE : AD_INQUIRIES (Demandes d'Espace Pub / Devenir Annonceur)
-- ====================================================================
DROP TABLE IF EXISTS `ad_inquiries`;
CREATE TABLE `ad_inquiries` (
  `id` VARCHAR(64) PRIMARY KEY,
  `nom_entreprise` VARCHAR(255) NOT NULL,
  `contact_nom` VARCHAR(255) NOT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `telephone` VARCHAR(50) NOT NULL,
  `format_souhaite` VARCHAR(100) DEFAULT 'banner_inline',
  `duree_mois` SMALLINT UNSIGNED DEFAULT 1,
  `budget_estime` DECIMAL(12, 2) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `statut` ENUM('nouvelle', 'contacte', 'devis_envoye', 'validee', 'rejetee') NOT NULL DEFAULT 'nouvelle',
  `notes_internes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_inq_statut` (`statut`),
  INDEX `idx_inq_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 21. TABLE : VEHICLE_BOOSTS (Options Visibilité & Surclassements Véhicules)
-- ====================================================================
DROP TABLE IF EXISTS `vehicle_boosts`;
CREATE TABLE `vehicle_boosts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `vehicle_id` BIGINT UNSIGNED NOT NULL,
  `boost_type` ENUM('featured', 'sponsored', 'bump', 'badge_premium', 'boost_top_search', 'boost_urgent', 'boost_certifie', 'boost_carrousel_home') NOT NULL,
  `duration_days` SMALLINT UNSIGNED NOT NULL DEFAULT 7,
  `date_debut` DATETIME NOT NULL,
  `date_fin` DATETIME NOT NULL,
  `order_id` VARCHAR(64) DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_vboost_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  INDEX `idx_vboost_active` (`vehicle_id`, `is_active`, `date_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- VUES DE RÉTROCOMPATIBILITÉ ET OPTIMISATION (HIGH PERFORMANCE VIEWS)
-- ====================================================================

-- 1. Vue de compatibilité dealerships -> dealers
CREATE OR REPLACE VIEW `dealerships` AS
SELECT * FROM `dealers`;

-- 2. Vue de compatibilité vehicle_favorites -> favorites
CREATE OR REPLACE VIEW `vehicle_favorites` AS
SELECT * FROM `favorites`;

-- 3. Vue de compatibilité leads -> contact_requests
CREATE OR REPLACE VIEW `leads` AS
SELECT * FROM `contact_requests`;

-- 4. Vue Catalogue Ultra-Rapide : Véhicules Disponibles avec Photo Principale & Concession
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
-- DÉCLENCHEURS (TRIGGERS) D'INTÉGRITÉ & DE COMPTEURS
-- ====================================================================

DELIMITER $$

-- 1. Incrémenter le compteur de favoris lors d'un ajout
CREATE TRIGGER `trg_favorite_added` AFTER INSERT ON `favorites`
FOR EACH ROW
BEGIN
  UPDATE `vehicles` SET `favorites_count` = `favorites_count` + 1 WHERE `id` = NEW.vehicle_id;
END$$

-- 2. Décrémenter le compteur de favoris lors d'une suppression
CREATE TRIGGER `trg_favorite_removed` AFTER DELETE ON `favorites`
FOR EACH ROW
BEGIN
  UPDATE `vehicles` SET `favorites_count` = GREATEST(0, `favorites_count` - 1) WHERE `id` = OLD.vehicle_id;
END$$

-- 3. Incrémenter le compteur de leads / demandes lors d'une soumission
CREATE TRIGGER `trg_lead_added` AFTER INSERT ON `contact_requests`
FOR EACH ROW
BEGIN
  IF NEW.vehicle_id IS NOT NULL THEN
    UPDATE `vehicles` SET `leads_count` = `leads_count` + 1 WHERE `id` = NEW.vehicle_id;
  END IF;
END$$

DELIMITER ;

-- ====================================================================
-- DONNÉES INITIALES RÉALISTES POUR CONGOCAR (KINSHASA & RDC)
-- Mot de passe par défaut pour tous les comptes : Admin1234!
-- (Hachage bcrypt : $2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC)
-- ====================================================================

-- 1. Utilisateurs Principaux (Admin, Concessionnaires, Acheteurs)
INSERT INTO `users` (`id`, `uuid`, `first_name`, `last_name`, `name`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`) VALUES
(1, 'usr-uuid-admin-001', 'Admin', 'CONGOCAR', 'Administrateur CONGOCAR', 'admin@congocar.cd', '+243 810 000 001', '$2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC', 'superadmin', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', NOW()),
(2, 'usr-uuid-dealer-001', 'Christian', 'Kalonji', 'Christian Kalonji', 'direction@prestigeauto-kin.cd', '+243 898 001 002', '$2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC', 'dealer', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', NOW()),
(3, 'usr-uuid-dealer-002', 'Patrick', 'Muteba', 'Patrick Muteba', 'ventes@joossmotors.cd', '+243 822 111 222', '$2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC', 'dealer', 'active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', NOW()),
(4, 'usr-uuid-garage-001', 'Jean-Paul', 'Mbayo', 'Jean-Paul Mbayo', 'atelier@autoclinique-kin.cd', '+243 812 345 678', '$2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC', 'garage', 'active', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80', NOW()),
(5, 'usr-uuid-client-001', 'Alain', 'Kalala', 'Alain Kalala', 'client.kalala@gmail.com', '+243 811 999 888', '$2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC', 'client', 'active', NULL, NOW());

-- 2. Plans d'Abonnement SaaS
INSERT INTO `subscription_plans` (`id`, `code`, `name`, `target_type`, `price_usd`, `price_cdf`, `billing_cycle`, `trial_days`, `max_vehicles`, `max_featured_vehicles`, `has_crm_leads`, `has_whatsapp_direct`, `has_analytics`, `has_verified_badge`, `display_order`) VALUES
(1, 'starter', 'Formule Starter Découverte', 'dealer', 0.00, 0.00, 'monthly', 14, 5, 1, 1, 1, 0, 0, 1),
(2, 'pro', 'Formule Pro Concessionnaire', 'dealer', 79.00, 225150.00, 'monthly', 14, 25, 5, 1, 1, 1, 1, 2),
(3, 'enterprise', 'Formule Élite Multi-Concessions', 'dealer', 199.00, 567150.00, 'monthly', 0, 100, 20, 1, 1, 1, 1, 3),
(4, 'garage_pro', 'Partenaire Garage & SOS Dépannage', 'garage', 49.00, 139650.00, 'monthly', 14, 0, 0, 1, 1, 1, 1, 4);

-- 3. Concessionnaires Partenaires (Kinshasa)
INSERT INTO `dealers` (`id`, `uuid`, `user_id`, `nom`, `slug`, `dealership_type`, `slogan`, `description`, `rccm`, `id_nat`, `email`, `telephone`, `whatsapp`, `site_web`, `adresse`, `commune`, `ville`, `horaires`, `logo_url`, `banner_url`, `verified`, `statut_abonnement`, `plan_id`) VALUES
(1, 'dlr-uuid-001', 2, 'Prestige Auto Kinshasa', 'prestige-auto-kinshasa', 'franchise_officielle', 'Concessionnaire Agréé Véhicules Premium & 4x4 Tout-Terrain', 'Leader de la vente de véhicules de prestige neufs et occasions certifiées à Kinshasa.', 'CD/KIN/RCCM/19-B-01452', '01-83-N48201A', 'contact@prestigeauto-kin.cd', '+243 898 001 002', '+243 898 001 002', 'https://prestigeauto-kin.cd', 'Boulevard du 30 Juin, En face Batetela', 'Gombe', 'Kinshasa', 'Lun - Sam : 08h00 - 18h30', 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80', 'https://images.unsplash.com/photo-1562141961-b5d1855d7f37?auto=format&fit=crop&w=1200&q=80', 1, 'actif', 'pro'),
(2, 'dlr-uuid-002', 3, 'Jooss Motors Kinshasa', 'jooss-motors-kinshasa', 'importateur', 'Spécialiste Importation Véhicules Japon & Dubaï Décrochés', 'Showroom spécialisé en Toyota Land Cruiser, Hilux et berlines japonaises.', 'CD/KIN/RCCM/21-A-09321', '01-84-M91024B', 'contact@joossmotors.cd', '+243 822 111 222', '+243 822 111 222', 'https://joossmotors.cd', '12ème Rue Limete, Voie Principale', 'Limete', 'Kinshasa', 'Lun - Sam : 08h30 - 18h00', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=200&q=80', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 1, 'actif', 'enterprise');

-- 4. Garages & Centres SOS Dépannage 24/7 (Kinshasa)
INSERT INTO `garages` (`id`, `uuid`, `user_id`, `nom`, `slug`, `commune`, `ville`, `adresse`, `telephone`, `whatsapp`, `email`, `horaires`, `is_open_24h`, `has_towing_truck`, `has_mobile_mechanic`, `specialties`, `photo_url`, `rating`, `total_reviews`, `verified`) VALUES
(1, 'grg-uuid-001', 4, 'AutoClinique Kinshasa Limete', 'autoclinique-kinshasa-limete', 'Limete', 'Kinshasa', '1ère Rue Résidentiel, N°14', '+243 812 345 678', '+243 812 345 678', 'contact@autoclinique-kin.cd', '24h/24 - 7j/7 Intervention immédiate', 1, 1, 1, '["Mecanique_Generale", "Diagnostic_Electronique", "Depannage_Urgence_24h", "Boite_Automatique", "Electricite_Auto"]', 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80', 4.90, 48, 1),
(2, 'grg-uuid-002', 1, 'Gombe Bosch Service Express', 'gombe-bosch-service-express', 'Gombe', 'Kinshasa', 'Avenue du Port, En face Gare Centrale', '+243 899 112 233', '+243 899 112 233', 'gombe-service@bosch.cd', 'Lun - Sam : 07h30 - 18h00', 0, 0, 1, '["Diagnostic_Electronique", "Climatisation", "Injecteurs_Diesel", "Freinage_ABS"]', 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80', 4.85, 36, 1),
(3, 'grg-uuid-003', 1, 'SOS Remorquage 24/7 Kinshasa', 'sos-remorquage-24-7-kinshasa', 'Ngaliema', 'Kinshasa', 'Route de Matadi, Arrêt Kintambo Magasin', '+243 820 999 888', '+243 820 999 888', 'urgence@soskinshasa.cd', '24h/24 - 7j/7', 1, 1, 1, '["Remorquage_Depanneuse", "Depannage_Urgence_24h", "Batterie_Demarrage", "Pneumatiques"]', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', 4.95, 62, 1);

-- 5. Marques Automobiles
INSERT INTO `brands` (`id`, `name`, `slug`, `logo_url`, `country_origin`, `is_popular`, `display_order`, `vehicles_count`) VALUES
(1, 'Toyota', 'toyota', 'https://www.carlogos.org/car-logos/toyota-logo.png', 'Japon', 1, 1, 12),
(2, 'Mercedes-Benz', 'mercedes-benz', 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png', 'Allemagne', 1, 2, 8),
(3, 'BMW', 'bmw', 'https://www.carlogos.org/car-logos/bmw-logo.png', 'Allemagne', 1, 3, 6),
(4, 'Hyundai', 'hyundai', 'https://www.carlogos.org/car-logos/hyundai-logo.png', 'Corée du Sud', 1, 4, 5),
(5, 'Nissan', 'nissan', 'https://www.carlogos.org/car-logos/nissan-logo.png', 'Japon', 1, 5, 4),
(6, 'Land Rover', 'land-rover', 'https://www.carlogos.org/car-logos/land-rover-logo.png', 'Royaume-Uni', 1, 6, 4),
(7, 'Lexus', 'lexus', 'https://www.carlogos.org/car-logos/lexus-logo.png', 'Japon', 1, 7, 3),
(8, 'Ford', 'ford', 'https://www.carlogos.org/car-logos/ford-logo.png', 'USA', 1, 8, 3),
(9, 'Kia', 'kia', 'https://www.carlogos.org/car-logos/kia-logo.png', 'Corée du Sud', 1, 9, 3),
(10, 'Porsche', 'porsche', 'https://www.carlogos.org/car-logos/porsche-logo.png', 'Allemagne', 0, 10, 2);

-- 6. Modèles Populaires
INSERT INTO `models` (`id`, `brand_id`, `name`, `slug`, `default_body_type`) VALUES
(1, 1, 'Land Cruiser Prado VXR', 'land-cruiser-prado-vxr', 'SUV'),
(2, 1, 'Land Cruiser 300 ZX', 'land-cruiser-300-zx', 'SUV'),
(3, 1, 'Hilux Double Cabine', 'hilux-double-cabine', 'Pick-up'),
(4, 1, 'RAV4 Hybride', 'rav4-hybride', 'SUV'),
(5, 2, 'Classe G 63 AMG', 'classe-g-63-amg', 'SUV'),
(6, 2, 'GLE 450 4MATIC', 'gle-450-4matic', 'SUV'),
(7, 2, 'Classe C 300', 'classe-c-300', 'Berline'),
(8, 3, 'X5 xDrive40i', 'x5-xdrive40i', 'SUV'),
(9, 3, 'Série 3 330i', 'serie-3-330i', 'Berline'),
(10, 4, 'Tucson N Line', 'tucson-n-line', 'SUV'),
(11, 6, 'Range Rover Sport', 'range-rover-sport', 'SUV');

-- 7. Véhicules en Stock CONGOCAR
INSERT INTO `vehicles` (`id`, `uuid`, `dealership_id`, `user_id`, `brand_id`, `model_id`, `marque`, `modele`, `finition`, `annee`, `prix`, `currency`, `msrp`, `remise_instantanee`, `ancien_prix`, `en_promo`, `kilometrage`, `carburant`, `transmission`, `motrice`, `categorie`, `etat`, `status`, `puissance_ch`, `puissance_fiscale`, `couleur`, `couleur_interieure`, `moteur`, `portes`, `places`, `garantie_mois`, `vin`, `description`, `equipements`, `en_vedette`, `views_count`, `created_at`) VALUES
(1, 'veh-uuid-001', 1, 2, 1, 1, 'Toyota', 'Land Cruiser Prado VXR', 'Executive 4x4 Pack Luxe', 2023, 79500.00, 'USD', 84000.00, 4500.00, 84000.00, 1, 14500, 'Diesel', 'Automatique', '4x4 Permanent', 'SUV', 'occasion_kinshasa', 'disponible', 204, 11, 'Blanc Nacré', 'Cuir Noir', '2.8L D-4D Turbo', 5, 7, 24, 'JTEBU5JR8K5019284', 'Superbe Toyota Land Cruiser Prado en parfait état, révision complète effectuée à Kinshasa. Climatisation tri-zone tropicalisée, toit ouvrant, caméras 360°, suspension adaptative.', '["Toit ouvrant", "Sellerie cuir", "GPS Grand Écran", "Caméra 360", "Attelage", "Bluetooth", "Régulateur adaptatif", "Jantes alliage 19 pouces"]', 1, 420, NOW()),
(2, 'veh-uuid-002', 1, 2, 2, 5, 'Mercedes-Benz', 'Classe G 63 AMG', 'BiTurbo 4MATIC Édition Spéciale', 2024, 215000.00, 'USD', 220000.00, 5000.00, 220000.00, 0, 4200, 'Essence', 'Automatique', '4x4 Permanent', 'SUV', 'occasion_importee', 'disponible', 585, 48, 'Noir Obsidienne', 'Cuir Nappa Rouge', '4.0L V8 Biturbo', 5, 5, 36, 'WDB4632761X891024', 'Icône absolue du prestige et de la puissance. Échappement sport AMG commutable, sonorisation Burmester Surround, pack carbone intérieur, véhicule dédouané à Kinshasa.', '["Pack AMG Performance", "Système Audio Burmester", "Affichage tête haute", "Suspension pilotée AMG Ride Control", "Éclairage d\'ambiance 64 couleurs"]', 1, 680, NOW()),
(3, 'veh-uuid-003', 2, 3, 4, 10, 'Hyundai', 'Tucson N Line', 'Hybride Rechargeable HTRAC', 2024, 38900.00, 'USD', 42000.00, 3100.00, 42000.00, 1, 0, 'Hybride', 'Automatique', 'AWD', 'SUV', 'neuf', 'disponible', 265, 9, 'Gris Shadow', 'Alcantara N Line', '1.6 T-GDi PHEV', 5, 5, 60, 'KMHJ881CBRU391022', 'Véhicule neuf zéro kilomètre disponible immédiatement dans notre showroom de Limete. Garantie constructeur 5 ans, autonomie 100% électrique de 62 km.', '["Compteurs digitaux 10.25 pouces", "Aide au maintien dans la voie", "Chargeur smartphone sans fil", "Hayon électrique mains libres"]', 1, 290, NOW()),
(4, 'veh-uuid-004', 2, 3, 3, 9, 'BMW', 'Série 3 330i xDrive', 'Pack M Sport', 2022, 44500.00, 'USD', 47000.00, 2500.00, 47000.00, 0, 31000, 'Essence', 'Automatique', 'AWD', 'Berline', 'occasion_importee', 'disponible', 258, 15, 'Bleu Portimao', 'Sensatec Cognac', '2.0L TwinPower Turbo', 4, 5, 12, 'WBA5R7103NCK91823', 'Berline sportive avec le pack aérodynamique M, feux Shadow Line laser, sièges chauffants et jantes bicolores 19 pouces.', '["Pack M Sport", "Projecteurs BMW Laser", "Park Assist", "Apple CarPlay / Android Auto sans fil"]', 0, 195, NOW());

-- 8. Photos des Véhicules
INSERT INTO `vehicle_images` (`vehicle_id`, `image_url`, `is_primary`, `display_order`) VALUES
(1, 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80', 1, 0),
(1, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80', 0, 1),
(2, 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80', 1, 0),
(3, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 1, 0),
(4, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', 1, 0);

-- 9. Favoris Exemples
INSERT INTO `favorites` (`user_id`, `vehicle_id`, `created_at`) VALUES
(5, 1, NOW()),
(5, 2, NOW());

-- 10. Messages Inter-Utilisateurs
INSERT INTO `messages` (`conversation_id`, `sender_id`, `receiver_id`, `vehicle_id`, `message_text`, `is_read`, `created_at`) VALUES
('conv-prado-kalala-001', 5, 2, 1, 'Bonjour Monsieur Kalonji, ce Prado 2023 est-il disponible pour une visite demain après-midi au showroom ?', 1, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('conv-prado-kalala-001', 2, 5, 1, 'Bonjour Alain, oui tout à fait ! Il est exposé dans notre showroom de Gombe. Je vous réserve un essai à 15h.', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- 11. Demandes Clients (Contact Requests / Leads)
INSERT INTO `contact_requests` (`uuid`, `dealership_id`, `vehicle_id`, `user_id`, `vehicle_title`, `vehicle_price`, `nom_client`, `email`, `telephone`, `type_demande`, `date_souhaitee`, `horaire_souhaite`, `message`, `offre_prix_proposee`, `statut`) VALUES
('lead-uuid-001', 1, 1, 5, 'Toyota Land Cruiser Prado VXR 2023', 79500.00, 'Alain Kalala', 'client.kalala@gmail.com', '+243 811 999 888', 'essai', CURDATE(), '15h00', 'Demande d\'essai routier pour le Land Cruiser Prado VXR.', NULL, 'rdv_fixe'),
('lead-uuid-002', 1, 2, NULL, 'Mercedes-Benz Classe G 63 AMG 2024', 215000.00, 'Cabinet Serge Mobutu', 'contact@sm-law.cd', '+243 899 777 666', 'offre_prix', NULL, NULL, 'Proposition de rachat ferme comptant avec immatriculation Kinshasa.', 205000.00, 'contacte');

-- 12. Signalements (Reports)
INSERT INTO `reports` (`uuid`, `reporter_user_id`, `reported_vehicle_id`, `reason`, `description`, `status`) VALUES
('rep-uuid-001', 5, 4, 'incorrect_price', 'Vérification du prix demandée par l\'acheteur, le prix promotionnel différait de la fiche vitrine.', 'resolved_action_taken');

-- 13. Notifications Utilisateurs
INSERT INTO `notifications` (`user_id`, `type`, `title`, `body`, `action_url`, `is_read`) VALUES
(2, 'new_lead', 'Nouveau Lead Essai Routier', 'Alain Kalala a sollicité un essai routier pour le Toyota Land Cruiser Prado 2023.', '/admin/leads/1', 0),
(5, 'price_drop', 'Baisse de Prix sur votre Véhicule Favori', 'Le Prado VXR que vous suivez bénéficie désormais d\'une remise de 4 500 $ !', '/vehicles/1', 0);

-- 14. Abonnements Actifs (Subscriptions)
INSERT INTO `subscriptions` (`uuid`, `plan_id`, `dealer_id`, `status`, `billing_cycle`, `price_usd`, `price_cdf`, `max_vehicles_allowed`, `max_featured_allowed`, `current_period_start`, `current_period_end`, `auto_renew`) VALUES
('sub-uuid-001', 2, 1, 'active', 'monthly', 79.00, 225150.00, 25, 5, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 1),
('sub-uuid-002', 3, 2, 'active', 'monthly', 199.00, 567150.00, 100, 20, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 1);

-- 15. Transactions & Paiements (Payments via Mobile Money RDC)
INSERT INTO `payments` (`uuid`, `transaction_reference`, `user_id`, `dealer_id`, `subscription_id`, `purpose`, `amount`, `currency`, `exchange_rate`, `payment_method`, `gateway`, `gateway_reference`, `payer_phone`, `payer_name`, `status`, `paid_at`) VALUES
('pay-uuid-001', 'CC-TX-2026-90124', 2, 1, 1, 'subscription', 79.00, 'USD', 2850.0000, 'mpesa', 'maxicash', 'MPESA-CD-891024810', '+243 898 001 002', 'Christian Kalonji', 'completed', NOW()),
('pay-uuid-002', 'CC-TX-2026-90125', 3, 2, 2, 'subscription', 199.00, 'USD', 2850.0000, 'orange_money', 'maxicash', 'OM-CD-391029411', '+243 822 111 222', 'Patrick Muteba', 'completed', NOW());

-- 16. Avis et Notations Clients
INSERT INTO `reviews` (`user_id`, `dealer_id`, `rating`, `title`, `comment`, `is_approved`) VALUES
(5, 1, 5, 'Service exceptionnel à Gombe', 'Accueil très professionnel de l\'équipe Prestige Auto. Démarches d\'immatriculation gérées en moins de 48h !', 1);

-- 17. Audit Log
INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `details`) VALUES
(1, 'DATABASE_INIT', 'SYSTEM', 1, '127.0.0.1', '{"message": "Initialisation de la base de données CONGOCAR version 2.5 réussie"}');

-- 18. Campagnes Publicitaires Actives (Ad Campaigns)
INSERT INTO `ad_campaigns` (`id`, `titre`, `annonceur`, `tag`, `format`, `emplacement`, `image_url`, `description`, `cta_text`, `cta_url`, `badge_color`, `impressions`, `clics`, `date_debut`, `date_fin`, `is_active`) VALUES
('camp-rawbank-credit-auto', 'Crédit Auto Rawbank jusqu’à 80%', 'Rawbank RDC', 'Partenaire Financement Officiel', 'banner_inline', 'catalogue_inline', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200', 'Financez l’achat de votre véhicule neuf ou d’occasion avec un taux préférentiel et une réponse rapide à Kinshasa.', 'Simuler mon Crédit', '#financement', 'bg-emerald-600 text-white', 28450, 1420, '2025-01-01', '2026-12-31', 1),
('camp-sonas-assurance', 'Assurance Automobile Obligatoire & Tous Risques SONAS', 'SONAS RDC', 'Partenaire Assurance', 'banner_leaderboard', 'home_top', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200', 'Attestation instantanée délivrée sur WhatsApp pour circuler en toute sérénité à Kinshasa et en provinces.', 'Demander un Devis', '#assurance', 'bg-blue-600 text-white', 54200, 2180, '2025-01-01', '2026-12-31', 1),
('camp-sonas-sidebar', 'Souscrivez votre assurance auto en 3 minutes', 'SONAS SA', 'Assurance Immédiate', 'sidebar_box', 'vehicle_detail_sidebar', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800', 'Formule au tiers ou tous risques adaptée au réseau routier de Kinshasa.', 'Tarifs Assurance', '#assurance', 'bg-blue-600 text-white', 19800, 890, '2025-01-01', '2026-12-31', 1),
('camp-total-lubrifiants', 'Huile Moteur Quartz TotalEnergies : Protection Maximale', 'TotalEnergies RDC', 'Partenaire Entretien Moteur', 'banner_sos', 'annuaire_garages', 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200', 'Optimisée pour les conditions routières et le climat tropical de Kinshasa. Disponible dans toutes les stations-services.', 'Localiser une Station', '#garages', 'bg-rose-600 text-white', 14100, 620, '2025-01-01', '2026-12-31', 1);

-- 19. Commandes de Monétisation (Monetization Orders)
INSERT INTO `monetization_orders` (`id`, `type`, `item_id`, `item_nom`, `target_vehicle_id`, `dealership_id`, `client_nom`, `client_phone`, `montant_usd`, `devise`, `payment_method`, `payment_reference`, `status`, `created_at`) VALUES
('ORD-2026-001', 'listing_tier', 'featured', 'Passage Annonce À la Une (Toyota Land Cruiser Prado VXR)', 1, 1, 'Auto Prestige Kinshasa', '+243 81 555 0101', 29.00, 'USD', 'mpesa', 'MP-89241044', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ORD-2026-002', 'visibility_boost', 'boost_urgent', 'Badge Urgent (Hyundai Tucson N Line)', 3, 2, 'M. Jean-Luc Kalonji', '+243 99 888 1234', 3.00, 'USD', 'orange_money', 'OM-34982103', 'completed', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
('ORD-2026-003', 'dealership_subscription', 'pro', 'Abonnement Mensuel Concession Pro', NULL, 1, 'Auto Prestige Kinshasa', '+243 81 555 0101', 99.00, 'USD', 'virement', 'VIR-RAW-9921', 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY));

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- FIN DU SCRIPT MYSQL CONGOCAR - BASE DE DONNÉES PRÊTE À L'EMPLOI
-- ====================================================================
