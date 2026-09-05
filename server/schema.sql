-- ====================================================================
-- BASE DE DONNÉES MYSQL POUR PLATEFORME CONCESSIONNAIRES AUTOMOBILES & GARAGES
-- Compatible MySQL 5.7, 8.0 et MariaDB (Hostinger / cPanel / VPS)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `concession_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `concession_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ====================================================================
-- TABLE 1 : USERS (Clients, Concessionnaires, Vendeurs, Garagistes, Admin)
-- ====================================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'dealer', 'salesperson', 'garage', 'admin') NOT NULL DEFAULT 'user',
  `phone` VARCHAR(50) DEFAULT NULL,
  `avatar` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 2 : DEALERSHIPS (Concessions Automobiles / Garages Vendeurs)
-- ====================================================================
DROP TABLE IF EXISTS `dealerships`;
CREATE TABLE `dealerships` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `slogan` VARCHAR(255) DEFAULT NULL,
  `adresse` VARCHAR(255) DEFAULT NULL,
  `ville` VARCHAR(100) DEFAULT 'Kinshasa',
  `code_postal` VARCHAR(20) DEFAULT NULL,
  `telephone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `horaires` VARCHAR(255) DEFAULT 'Lun - Sam : 08h00 - 18h00',
  `site_web` VARCHAR(255) DEFAULT NULL,
  `logo_url` VARCHAR(500) DEFAULT NULL,
  `banner_url` VARCHAR(500) DEFAULT NULL,
  `siret` VARCHAR(50) DEFAULT NULL,
  `statut_abonnement` ENUM('essai_gratuit', 'actif', 'facture_en_attente', 'suspendu', 'expire') DEFAULT 'essai_gratuit',
  `plan_id` ENUM('starter', 'pro', 'enterprise') DEFAULT 'starter',
  `fin_essai_gratuit` DATETIME DEFAULT NULL,
  `verified` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_dealerships_nom` (`nom`),
  INDEX `idx_dealerships_ville` (`ville`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 3 : VEHICLES (Véhicules en Stock dans les Concessions)
-- ====================================================================
DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dealership_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `marque` VARCHAR(100) NOT NULL,
  `modele` VARCHAR(100) NOT NULL,
  `finition` VARCHAR(150) DEFAULT '',
  `annee` INT NOT NULL,
  `prix` DECIMAL(12, 2) NOT NULL,
  `msrp` DECIMAL(12, 2) DEFAULT NULL,
  `remise_instantanee` DECIMAL(12, 2) DEFAULT 0,
  `ancien_prix` DECIMAL(12, 2) DEFAULT NULL,
  `en_promo` BOOLEAN DEFAULT FALSE,
  `kilometrage` INT NOT NULL DEFAULT 0,
  `carburant` ENUM('Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL') NOT NULL DEFAULT 'Essence',
  `transmission` ENUM('Automatique', 'Manuelle') NOT NULL DEFAULT 'Automatique',
  `categorie` ENUM('SUV', 'Berline', 'Citadine', 'Coupé', 'Cabriolet', 'Break', 'Utilitaire') NOT NULL DEFAULT 'Berline',
  `etat` ENUM('neuf', 'occasion') NOT NULL DEFAULT 'occasion',
  `status` ENUM('disponible', 'reserve', 'vendu') NOT NULL DEFAULT 'disponible',
  `puissance_ch` INT DEFAULT 0,
  `puissance_fiscale` INT DEFAULT 0,
  `couleur` VARCHAR(50) DEFAULT 'Noir',
  `couleur_interieure` VARCHAR(50) DEFAULT NULL,
  `moteur` VARCHAR(100) DEFAULT NULL,
  `motrice` VARCHAR(50) DEFAULT 'Traction',
  `portes` INT DEFAULT 5,
  `places` INT DEFAULT 5,
  `co2_gkm` INT DEFAULT 0,
  `garantie_mois` INT DEFAULT 12,
  `vin` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `equipements` JSON DEFAULT NULL,
  `en_vedette` BOOLEAN DEFAULT FALSE,
  `views_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`dealership_id`) REFERENCES `dealerships` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_vehicles_marque_modele` (`marque`, `modele`),
  INDEX `idx_vehicles_prix` (`prix`),
  INDEX `idx_vehicles_annee` (`annee`),
  INDEX `idx_vehicles_km` (`kilometrage`),
  INDEX `idx_vehicles_carburant` (`carburant`),
  INDEX `idx_vehicles_categorie` (`categorie`),
  INDEX `idx_vehicles_status` (`status`),
  INDEX `idx_vehicles_en_vedette` (`en_vedette`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 4 : VEHICLE_IMAGES (Photos des Véhicules)
-- ====================================================================
DROP TABLE IF EXISTS `vehicle_images`;
CREATE TABLE `vehicle_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehicle_id` INT NOT NULL,
  `image_url` VARCHAR(1000) NOT NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  INDEX `idx_images_vehicle` (`vehicle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 5 : LEADS (Demandes Clients : Essai, Devis, Reprise, Offre Prix)
-- ====================================================================
DROP TABLE IF EXISTS `leads`;
CREATE TABLE `leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dealership_id` INT DEFAULT NULL,
  `vehicle_id` INT DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `vehicle_title` VARCHAR(255) NOT NULL,
  `vehicle_price` DECIMAL(12, 2) DEFAULT 0,
  `nom_client` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `telephone` VARCHAR(50) NOT NULL,
  `type_demande` ENUM('essai', 'information', 'offre_reprise', 'financement', 'offre_prix') NOT NULL DEFAULT 'information',
  `date_souhaitee` DATE DEFAULT NULL,
  `horaire_souhaite` VARCHAR(50) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `offre_prix_proposee` DECIMAL(12, 2) DEFAULT NULL,
  `vehicule_reprise_info` TEXT DEFAULT NULL,
  `statut` ENUM('nouveau', 'contacte', 'rdv_fixe', 'conclu', 'annule') NOT NULL DEFAULT 'nouveau',
  `notes_admin` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`dealership_id`) REFERENCES `dealerships` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_leads_dealership` (`dealership_id`),
  INDEX `idx_leads_statut` (`statut`),
  INDEX `idx_leads_type` (`type_demande`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 6 : VEHICLE_FAVORITES (Véhicules Sauvegardés par les Acheteurs)
-- ====================================================================
DROP TABLE IF EXISTS `vehicle_favorites`;
CREATE TABLE `vehicle_favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `vehicle_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_vehicle_unique` (`user_id`, `vehicle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 7 : GARAGES (Ateliers Mécaniques, Centres Auto & Dépannage)
-- ====================================================================
DROP TABLE IF EXISTS `garages`;
CREATE TABLE `garages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `commune` VARCHAR(100) NOT NULL,
  `adresse` VARCHAR(255) DEFAULT NULL,
  `telephone` VARCHAR(50) NOT NULL,
  `whatsapp` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `horaires` VARCHAR(255) DEFAULT 'Lun - Sam : 08h00 - 18h00',
  `specialties` JSON DEFAULT NULL,
  `is_open_24h` BOOLEAN DEFAULT FALSE,
  `rating` DECIMAL(3, 2) DEFAULT 5.00,
  `total_reviews` INT DEFAULT 1,
  `photo_url` VARCHAR(1000) DEFAULT NULL,
  `verified` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_garages_commune` (`commune`),
  INDEX `idx_garages_24h` (`is_open_24h`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 8 : BREAKDOWN_REQUESTS (Demandes SOS Dépannage & Remorquage 24/7)
-- ====================================================================
DROP TABLE IF EXISTS `breakdown_requests`;
CREATE TABLE `breakdown_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `garage_id` INT DEFAULT NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `client_phone` VARCHAR(50) NOT NULL,
  `commune` VARCHAR(100) NOT NULL,
  `car_model` VARCHAR(255) DEFAULT 'Non spécifié',
  `issue_description` TEXT NOT NULL,
  `status` ENUM('en_attente', 'pris_en_charge', 'termine', 'annule') NOT NULL DEFAULT 'en_attente',
  `emergency_level` ENUM('normal', 'urgent', 'critique_nuit') DEFAULT 'urgent',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE SET NULL,
  INDEX `idx_breakdown_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 9 : INVOICES (Facturation SaaS pour Concessions & Garages)
-- ====================================================================
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dealership_id` INT DEFAULT NULL,
  `garage_id` INT DEFAULT NULL,
  `type_entite` ENUM('concession', 'garage') NOT NULL DEFAULT 'concession',
  `montant_ht` DECIMAL(10, 2) NOT NULL,
  `tva` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `montant_ttc` DECIMAL(10, 2) NOT NULL,
  `date_emission` DATE NOT NULL,
  `date_echeance` DATE NOT NULL,
  `statut` ENUM('payee', 'en_attente', 'en_retard', 'annulee') NOT NULL DEFAULT 'en_attente',
  `periode` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `moyen_paiement` VARCHAR(50) DEFAULT 'Virement / Carte',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`dealership_id`) REFERENCES `dealerships` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- DONNÉES INITIALES POUR CONCESSIONS ET PARC AUTOMOBILE
-- Mot de passe par défaut pour tous les comptes : Admin1234!
-- ====================================================================

-- 1. Utilisateurs
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `avatar`, `created_at`) VALUES
(1, 'Administrateur Plateforme', 'admin@autoconcession.com', '$2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC', 'admin', '+243 810 000 001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', NOW()),
(2, 'Directeur Prestige Auto Gombe', 'direction@prestigeauto-kin.cd', '$2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC', 'dealer', '+243 898 001 002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', NOW()),
(3, 'Responsable Ventes Occasions', 'ventes@prestigeauto-kin.cd', '$2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC', 'salesperson', '+243 822 111 222', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', NOW()),
(4, 'Acheteur Particulier', 'client.auto@gmail.com', '$2a$10$w090b8f1kQzN4oW4v95DqeuH3s8.lPZp9oQ7/2ZzSg2kYQ/YcW4eC', 'user', '+243 811 999 888', NULL, NOW());

-- 2. Concession Automobile
INSERT INTO `dealerships` (`id`, `user_id`, `nom`, `slogan`, `adresse`, `ville`, `telephone`, `email`, `horaires`, `site_web`, `logo_url`, `banner_url`, `siret`, `statut_abonnement`, `plan_id`, `verified`, `created_at`) VALUES
(1, 2, 'Prestige Auto Kinshasa', 'Concessionnaire Agréé Véhicules Premium & Tout-Terrain', 'Boulevard du 30 Juin, En face Batetela', 'Kinshasa', '+243 898 001 002', 'contact@prestigeauto-kin.cd', 'Lun - Sam : 08h00 - 18h30', 'https://prestigeauto-kin.cd', 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80', 'https://images.unsplash.com/photo-1562141961-b5d1855d7f37?auto=format&fit=crop&w=1200&q=80', 'CD/KIN/RCCM/19-B-01452', 'actif', 'pro', 1, NOW());

-- 3. Véhicules en Stock
INSERT INTO `vehicles` (`id`, `dealership_id`, `user_id`, `marque`, `modele`, `finition`, `annee`, `prix`, `msrp`, `remise_instantanee`, `ancien_prix`, `en_promo`, `kilometrage`, `carburant`, `transmission`, `categorie`, `etat`, `status`, `puissance_ch`, `puissance_fiscale`, `couleur`, `couleur_interieure`, `moteur`, `motrice`, `portes`, `places`, `co2_gkm`, `garantie_mois`, `vin`, `description`, `equipements`, `en_vedette`, `views_count`, `created_at`) VALUES
(1, 1, 2, 'Toyota', 'Land Cruiser Prado VXR', 'Executive 4x4 Pack Luxe', 2023, 79500.00, 84000.00, 4500.00, 84000.00, 1, 14500, 'Diesel', 'Automatique', 'SUV', 'occasion', 'disponible', 204, 11, 'Blanc Nacré', 'Cuir Noir', '2.8L D-4D Turbo', '4x4 Permanent', 5, 7, 210, 24, 'JTEBU5JR8K5019284', 'Superbe Toyota Land Cruiser Prado en parfait état, révision complète effectuée. Climatisation tri-zone, toit ouvrant, caméras 360°, suspension adaptative.', '[\"Toit ouvrant\", \"Sellerie cuir\", \"GPS Grand Écran\", \"Caméra 360\", \"Attelage\", \"Bluetooth\", \"Régulateur adaptatif\", \"Jantes alliage 19 pouces\"]', 1, 320, NOW()),
(2, 1, 2, 'Mercedes-Benz', 'Classe G 63 AMG', 'BiTurbo 4MATIC Édition Spéciale', 2024, 215000.00, 220000.00, 5000.00, 220000.00, 0, 4200, 'Essence', 'Automatique', 'SUV', 'occasion', 'disponible', 585, 48, 'Noir Obsidienne', 'Cuir Nappa Rouge', '4.0L V8 Biturbo', 'Transmission intégrale 4MATIC', 5, 5, 335, 36, 'WDB4632761X891024', 'Icône du luxe et de la performance. Échappement sport AMG commutable, sonorisation Burmester Surround, pack carbone intérieur.', '[\"Pack AMG Performance\", \"Système Audio Burmester\", \"Affichage tête haute\", \"Suspension pilotée AMG Ride Control\", \"Éclairage d\\\'ambiance 64 couleurs\"]', 1, 510, NOW()),
(3, 1, 2, 'Hyundai', 'Tucson N Line', 'Hybride Rechargeable HTRAC', 2024, 38900.00, 42000.00, 3100.00, 42000.00, 1, 0, 'Hybride', 'Automatique', 'SUV', 'neuf', 'disponible', 265, 9, 'Gris Shadow', 'Alcantara N Line', '1.6 T-GDi PHEV', 'Transmission intégrale HTRAC', 5, 5, 31, 60, 'KMHJ881CBRU391022', 'Véhicule neuf zéro kilomètre disponible immédiatement en concession. Autonomie 100% électrique de 62 km.', '[\"Compteurs digitaux 10.25 pouces\", \"Aide au maintien dans la voie\", \"Chargeur smartphone sans fil\", \"Hayon électrique mains libres\"]', 1, 185, NOW()),
(4, 1, 2, 'BMW', 'Série 3 330i xDrive', 'Pack M Sport', 2022, 44500.00, 47000.00, 2500.00, 47000.00, 0, 31000, 'Essence', 'Automatique', 'Berline', 'occasion', 'disponible', 258, 15, 'Bleu Portimao', 'Sensatec Cognac', '2.0L TwinPower Turbo', 'Transmission intégrale xDrive', 4, 5, 152, 12, 'WBA5R7103NCK91823', 'Berline sportive avec le pack aérodynamique M, feux Shadow Line laser, sièges chauffants et jantes bicolores.', '[\"Pack M Sport\", \"Projecteurs BMW Laser\", \"Park Assist\", \"Apple CarPlay / Android Auto sans fil\"]', 0, 140, NOW());

-- 4. Photos Véhicules
INSERT INTO `vehicle_images` (`vehicle_id`, `image_url`, `is_primary`, `display_order`, `created_at`) VALUES
(1, 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80', 1, 0, NOW()),
(1, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80', 0, 1, NOW()),
(2, 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80', 1, 0, NOW()),
(3, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 1, 0, NOW()),
(4, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', 1, 0, NOW());

-- 5. Leads de Démonstration (Essais et Demandes de Prix)
INSERT INTO `leads` (`id`, `dealership_id`, `vehicle_id`, `user_id`, `vehicle_title`, `vehicle_price`, `nom_client`, `email`, `telephone`, `type_demande`, `date_souhaitee`, `horaire_souhaite`, `message`, `offre_prix_proposee`, `statut`, `created_at`) VALUES
(1, 1, 1, 4, 'Toyota Land Cruiser Prado VXR 2023', 79500.00, 'Alain Kalala', 'client.auto@gmail.com', '+243 811 999 888', 'essai', '2026-09-10', '14h00', 'Bonjour, je souhaiterais essayer ce Prado ce jeudi après-midi au showroom.', NULL, 'rdv_fixe', NOW()),
(2, 1, 2, NULL, 'Mercedes-Benz Classe G 63 AMG', 215000.00, 'Cabinet Serge Mobutu', 'contact@sm-law.cd', '+243 899 777 666', 'offre_prix', NULL, NULL, 'Pouvez-vous nous proposer une offre dédouanée avec immatriculation Kinshasa ?', 205000.00, 'contacte', NOW());

-- 6. Garages Partenaires
INSERT INTO `garages` (`id`, `user_id`, `nom`, `commune`, `adresse`, `telephone`, `whatsapp`, `email`, `opening_hours`, `specialties`, `is_open_24h`, `rating`, `total_reviews`, `photo_url`, `verified`, `created_at`) VALUES
(1, 1, 'AutoClinique Kinshasa', 'Limete', '1ère Rue Résidentiel, N°14', '+243 812 345 678', '+243 812 345 678', 'contact@autoclinique-kin.cd', 'Lun - Dim : 24h/24', '[\"Mecanique_Generale\", \"Diagnostic_Electronique\", \"Depannage_Urgence_24h\", \"Electricite_Auto\"]', 1, 4.90, 34, 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80', 1, NOW()),
(2, 1, 'Gombe Bosch Service Express', 'Gombe', 'Avenue du Port, En face Gare Centrale', '+243 899 112 233', '+243 899 112 233', 'gombe-service@bosch.cd', 'Lun - Sam : 07h30 - 18h00', '[\"Diagnostic_Electronique\", \"Climatisation\", \"Injecteurs_Diesel\"]', 0, 4.85, 28, 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80', 1, NOW()),
(3, 1, 'SOS Remorquage 24/7 Kinshasa', 'Ngaliema', 'Route de Matadi, Arrêt Kintambo Magasin', '+243 820 999 888', '+243 820 999 888', 'urgence@soskinshasa.cd', '24h/24 - 7j/7 Intervention immédiate', '[\"Depannage_Urgence_24h\", \"Vulcanisateur_Pneus\", \"Batterie_Demarrage\"]', 1, 4.95, 52, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', 1, NOW());
