-- ====================================================================
-- 🚗 AUTOKIN (RDC) - SYSTÈME COMPLET DE MONÉTISATION & SAAS AUTOMOBILE
-- Fichier      : autokin_monetization.sql
-- Compatible   : MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+ (Hostinger / cPanel / Cloud)
-- Moteur       : InnoDB (Support complet des transactions ACID et clés étrangères)
-- Encodage     : utf8mb4 / utf8mb4_unicode_ci (Support complet accents & emojis)
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ====================================================================
-- 1. TABLE : USERS (Utilisateurs, Particuliers, Vendeurs Pro, Concessions, Admins)
-- ====================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) DEFAULT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashé (jamais en clair)',
  `role` ENUM('user', 'seller', 'dealer', 'garage', 'admin', 'superadmin') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'suspended', 'pending_verification') NOT NULL DEFAULT 'active',
  `preferred_currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `city` VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
  `address` VARCHAR(255) DEFAULT NULL,
  `avatar` VARCHAR(1000) DEFAULT NULL,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `phone_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`),
  INDEX `idx_users_phone` (`phone`),
  INDEX `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 2. TABLE : VEHICLES (Parc d'annonces auto publiées par les utilisateurs)
-- ====================================================================
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `dealership_id` BIGINT UNSIGNED DEFAULT NULL,
  `marque` VARCHAR(100) NOT NULL,
  `modele` VARCHAR(100) NOT NULL,
  `annee` SMALLINT UNSIGNED NOT NULL,
  `prix` DECIMAL(12, 2) NOT NULL,
  `currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `ancien_prix` DECIMAL(12, 2) DEFAULT NULL,
  `kilometrage` INT UNSIGNED NOT NULL DEFAULT 0,
  `carburant` ENUM('Essence', 'Diesel', 'Hybride', 'Hybride_Rechargeable', 'Électrique', 'GPL') NOT NULL DEFAULT 'Essence',
  `transmission` ENUM('Automatique', 'Manuelle', 'Sequentielle') NOT NULL DEFAULT 'Automatique',
  `categorie` ENUM('SUV', 'Berline', 'Citadine', 'Coupé', 'Cabriolet', 'Break', 'Pick-up', 'Utilitaire', 'Minibus') NOT NULL DEFAULT 'SUV',
  `etat` ENUM('neuf', 'occasion', 'occasion_kinshasa', 'occasion_importee') NOT NULL DEFAULT 'occasion',
  `status` ENUM('disponible', 'en_attente', 'reserve', 'vendu', 'archive') NOT NULL DEFAULT 'disponible',
  -- Drapeaux et colonnes de monétisation / visibilité
  `en_vedette` TINYINT(1) NOT NULL DEFAULT 0,
  `is_sponsored` TINYINT(1) NOT NULL DEFAULT 0,
  `listing_tier` ENUM('standard', 'featured', 'premium') NOT NULL DEFAULT 'standard',
  `featured_until` DATETIME DEFAULT NULL,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `ville` VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
  `commune` VARCHAR(100) DEFAULT 'Gombe',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_vehicles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_vehicles_user_status` (`user_id`, `status`, `deleted_at`),
  INDEX `idx_vehicles_marque_modele` (`marque`, `modele`),
  INDEX `idx_vehicles_prix` (`prix`, `currency`),
  INDEX `idx_vehicles_en_vedette` (`en_vedette`, `featured_until`),
  INDEX `idx_vehicles_listing_tier` (`listing_tier`),
  INDEX `idx_vehicles_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 3. TABLE : SUBSCRIPTION_PLANS (Grille des Forfaits SaaS Vendeurs & Concessions)
-- ====================================================================
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `target_role` ENUM('user', 'seller', 'dealer', 'garage') NOT NULL DEFAULT 'seller',
  `price_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `price_cdf` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `billing_cycle` ENUM('monthly', 'yearly', 'lifetime') NOT NULL DEFAULT 'monthly',
  `max_active_listings` INT UNSIGNED NOT NULL DEFAULT 3 COMMENT '3 pour particulier gratuit, 15 pour vendeur pro, 999999 pour illimité',
  `max_featured_listings` INT UNSIGNED NOT NULL DEFAULT 0,
  `badge_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `has_crm_leads` TINYINT(1) NOT NULL DEFAULT 1,
  `has_whatsapp_direct` TINYINT(1) NOT NULL DEFAULT 1,
  `has_analytics` TINYINT(1) NOT NULL DEFAULT 0,
  `features` JSON DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_sub_plans_code` (`code`),
  INDEX `idx_sub_plans_active_target` (`is_active`, `target_role`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 4. TABLE : USER_SUBSCRIPTIONS (Abonnements souscrits par les utilisateurs)
-- ====================================================================
CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `plan_id` INT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'active', 'past_due', 'canceled', 'expired', 'suspended') NOT NULL DEFAULT 'pending',
  `billing_cycle` ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  `amount_paid` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `starts_at` DATETIME NOT NULL,
  `ends_at` DATETIME NOT NULL,
  `canceled_at` DATETIME DEFAULT NULL,
  `auto_renew` TINYINT(1) NOT NULL DEFAULT 1,
  `max_vehicles_snapshot` INT UNSIGNED NOT NULL DEFAULT 3 COMMENT 'Quota de véhicules autorisés figé à la souscription',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_usub_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usub_plan_id` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT,
  INDEX `idx_usub_user_status` (`user_id`, `status`),
  INDEX `idx_usub_ends_status` (`ends_at`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 5. TABLE : PROMOTIONS (Mises en avant & Boosts individuels de véhicules)
-- ====================================================================
CREATE TABLE IF NOT EXISTS `promotions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `vehicle_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `promotion_type` ENUM('featured', 'sponsored', 'bump', 'badge_premium', 'urgent') NOT NULL DEFAULT 'featured',
  `duration_days` SMALLINT UNSIGNED NOT NULL DEFAULT 7,
  `starts_at` DATETIME NOT NULL,
  `ends_at` DATETIME NOT NULL,
  `status` ENUM('pending', 'active', 'expired', 'revoked') NOT NULL DEFAULT 'pending',
  `price_paid` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_promo_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_promo_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_promo_vehicle_status` (`vehicle_id`, `status`),
  INDEX `idx_promo_ends_status` (`ends_at`, `status`),
  INDEX `idx_promo_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 6. TABLE : ADVERTISEMENTS (Régie Publicitaire B2B, Bannières Annonceurs)
-- ====================================================================
CREATE TABLE IF NOT EXISTS `advertisements` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Peut être lié à un compte ou être un annonceur externe',
  `title` VARCHAR(255) NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `advertiser_name` VARCHAR(255) NOT NULL,
  `advertiser_email` VARCHAR(191) DEFAULT NULL,
  `advertiser_phone` VARCHAR(50) DEFAULT NULL,
  `placement` ENUM('homepage_top', 'catalogue_inline', 'vehicle_detail_sidebar', 'garage_directory', 'footer_banner') NOT NULL DEFAULT 'catalogue_inline',
  `ad_format` ENUM('banner_leaderboard', 'banner_inline', 'sidebar_box', 'banner_sos', 'popup') NOT NULL DEFAULT 'banner_inline',
  `image_url` VARCHAR(1000) NOT NULL,
  `target_url` VARCHAR(500) NOT NULL DEFAULT '#',
  `cta_text` VARCHAR(100) NOT NULL DEFAULT 'En savoir plus',
  `budget_usd` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `impressions_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `clicks_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `starts_at` DATE NOT NULL,
  `ends_at` DATE NOT NULL,
  `status` ENUM('pending', 'active', 'paused', 'expired', 'rejected') NOT NULL DEFAULT 'pending',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ads_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_ads_active_placement` (`is_active`, `placement`, `status`),
  INDEX `idx_ads_ends_at` (`ends_at`),
  INDEX `idx_ads_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 7. TABLE : PAYMENTS (Traçabilité financière, Mobile Money RDC & Cartes)
-- ====================================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) NOT NULL UNIQUE,
  `transaction_reference` VARCHAR(100) NOT NULL UNIQUE,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `subscription_id` BIGINT UNSIGNED DEFAULT NULL,
  `promotion_id` BIGINT UNSIGNED DEFAULT NULL,
  `vehicle_id` BIGINT UNSIGNED DEFAULT NULL,
  `advertisement_id` BIGINT UNSIGNED DEFAULT NULL,
  `purpose` ENUM('subscription', 'vehicle_promotion', 'advertisement', 'commission', 'other') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `currency` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
  `exchange_rate` DECIMAL(10, 4) NOT NULL DEFAULT 2850.0000 COMMENT 'Taux de change appliqué (ex: 2850 CDF pour 1 USD)',
  `payment_method` ENUM('mpesa', 'orange_money', 'airtel_money', 'afrimoney', 'card_visa_mastercard', 'bank_transfer', 'cash') NOT NULL,
  `gateway` VARCHAR(50) NOT NULL DEFAULT 'manual_or_maxicash',
  `gateway_reference` VARCHAR(255) DEFAULT NULL,
  `payer_phone` VARCHAR(50) DEFAULT NULL,
  `payer_name` VARCHAR(255) DEFAULT NULL,
  `payer_email` VARCHAR(191) DEFAULT NULL,
  `status` ENUM('pending', 'processing', 'completed', 'paid', 'failed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  `receipt_url` VARCHAR(1000) DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pay_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_pay_subscription_id` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pay_promotion_id` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pay_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pay_ad_id` FOREIGN KEY (`advertisement_id`) REFERENCES `advertisements` (`id`) ON DELETE SET NULL,
  INDEX `idx_pay_reference` (`transaction_reference`),
  INDEX `idx_pay_user_status` (`user_id`, `status`),
  INDEX `idx_pay_status_created` (`status`, `created_at`),
  INDEX `idx_pay_method` (`payment_method`),
  INDEX `idx_pay_purpose` (`purpose`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- VUES DE RÉTROCOMPATIBILITÉ (Permet le fonctionnement transparent du code)
-- ====================================================================
CREATE OR REPLACE VIEW `subscriptions` AS SELECT * FROM `user_subscriptions`;
CREATE OR REPLACE VIEW `vehicle_boosts` AS SELECT * FROM `promotions`;
CREATE OR REPLACE VIEW `ad_campaigns` AS SELECT * FROM `advertisements`;

-- ====================================================================
-- DONNÉES DE DÉPART : GRILLE DES FORFAITS (SEED SUBSCRIPTION PLANS)
-- ====================================================================
INSERT INTO `subscription_plans` 
  (`code`, `name`, `target_role`, `price_usd`, `price_cdf`, `billing_cycle`, `max_active_listings`, `max_featured_listings`, `badge_verified`, `has_crm_leads`, `has_whatsapp_direct`, `has_analytics`, `display_order`) 
VALUES
  ('free_particulier', 'Particulier Gratuit', 'user', 0.00, 0.00, 'lifetime', 3, 0, 0, 1, 1, 0, 1),
  ('pro_seller', 'Vendeur Pro Indépendant', 'seller', 49.00, 139650.00, 'monthly', 15, 2, 1, 1, 1, 1, 2),
  ('dealer_gold', 'Concessionnaire Gold Showroom', 'dealer', 149.00, 424650.00, 'monthly', 999999, 10, 1, 1, 1, 1, 3),
  ('garage_pro', 'Partenaire Garage & SOS Dépannage', 'garage', 49.00, 139650.00, 'monthly', 0, 0, 1, 1, 1, 1, 4)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `price_usd` = VALUES(`price_usd`),
  `max_active_listings` = VALUES(`max_active_listings`);

SET FOREIGN_KEY_CHECKS = 1;
