/**
 * 🚗 AUTOKIN - SCRIPT DE MIGRATION NODE.JS MYSQL / MARIADB
 * Exécution 100% Node.js via le package 'mysql2/promise' (compatible Hostinger Node.js App)
 * 
 * Usage :
 *   node server/scripts/migrate_monetization.js
 *   ou npm run migrate:monetization
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Chargement des variables d'environnement
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'congocar_db',
  multipleStatements: true
};

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(`SHOW TABLES LIKE ?`, [tableName]);
  return rows.length > 0;
}

async function getExistingColumns(connection, tableName) {
  const [rows] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
  return rows.map(r => r.Field.toLowerCase());
}

async function runMonetizationMigration() {
  console.log('\n======================================================');
  console.log('🚀 AUTOKIN - DÉMARRAGE DE LA MIGRATION MONÉTISATION (NODE.JS)');
  console.log('======================================================');
  console.log(`📡 Connexion à MySQL : ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}...`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connecté avec succès à la base de données MySQL.');
  } catch (err) {
    console.error('❌ Impossible de se connecter à MySQL :', err.message);
    console.error('👉 Vérifiez vos identifiants dans server/.env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
    process.exit(1);
  }

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // -----------------------------------------------------------------
    // 1. TABLE : users
    // -----------------------------------------------------------------
    const usersExist = await tableExists(connection, 'users');
    if (!usersExist) {
      console.log('📦 [1/7] Création de la table `users`...');
      await connection.query(`
        CREATE TABLE \`users\` (
          \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          \`uuid\` CHAR(36) NOT NULL UNIQUE,
          \`name\` VARCHAR(255) NOT NULL,
          \`first_name\` VARCHAR(100) DEFAULT NULL,
          \`last_name\` VARCHAR(100) DEFAULT NULL,
          \`email\` VARCHAR(191) NOT NULL UNIQUE,
          \`phone\` VARCHAR(50) DEFAULT NULL,
          \`password\` VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashé',
          \`role\` ENUM('user', 'seller', 'dealer', 'garage', 'admin', 'superadmin') NOT NULL DEFAULT 'user',
          \`status\` ENUM('active', 'inactive', 'suspended', 'pending_verification') NOT NULL DEFAULT 'active',
          \`preferred_currency\` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
          \`city\` VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
          \`address\` VARCHAR(255) DEFAULT NULL,
          \`avatar\` VARCHAR(1000) DEFAULT NULL,
          \`email_verified_at\` TIMESTAMP NULL DEFAULT NULL,
          \`phone_verified_at\` TIMESTAMP NULL DEFAULT NULL,
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
          INDEX \`idx_users_role\` (\`role\`),
          INDEX \`idx_users_status\` (\`status\`),
          INDEX \`idx_users_phone\` (\`phone\`),
          INDEX \`idx_users_deleted_at\` (\`deleted_at\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('   ✅ Table `users` créée.');
    } else {
      console.log('🔍 [1/7] Table `users` existante détectée. Analyse des colonnes...');
      const userCols = await getExistingColumns(connection, 'users');
      
      if (!userCols.includes('preferred_currency')) {
        console.log('   ⚡ ALTER TABLE `users` ADD `preferred_currency`...');
        await connection.query(`ALTER TABLE \`users\` ADD COLUMN \`preferred_currency\` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD' AFTER \`status\``);
      }
      if (!userCols.includes('status')) {
        console.log('   ⚡ ALTER TABLE `users` ADD `status`...');
        await connection.query(`ALTER TABLE \`users\` ADD COLUMN \`status\` ENUM('active', 'inactive', 'suspended', 'pending_verification') NOT NULL DEFAULT 'active'`);
      }
      console.log('   ✅ Table `users` vérifiée et à jour (aucune perte de données).');
    }

    // -----------------------------------------------------------------
    // 2. TABLE : vehicles
    // -----------------------------------------------------------------
    const vehiclesExist = await tableExists(connection, 'vehicles');
    if (!vehiclesExist) {
      console.log('📦 [2/7] Création de la table `vehicles`...');
      await connection.query(`
        CREATE TABLE \`vehicles\` (
          \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          \`uuid\` CHAR(36) NOT NULL UNIQUE,
          \`user_id\` BIGINT UNSIGNED DEFAULT NULL,
          \`marque\` VARCHAR(100) NOT NULL,
          \`modele\` VARCHAR(100) NOT NULL,
          \`annee\` SMALLINT UNSIGNED NOT NULL,
          \`prix\` DECIMAL(12, 2) NOT NULL,
          \`currency\` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
          \`ancien_prix\` DECIMAL(12, 2) DEFAULT NULL,
          \`kilometrage\` INT UNSIGNED NOT NULL DEFAULT 0,
          \`carburant\` ENUM('Essence', 'Diesel', 'Hybride', 'Hybride_Rechargeable', 'Électrique', 'GPL') NOT NULL DEFAULT 'Essence',
          \`transmission\` ENUM('Automatique', 'Manuelle', 'Sequentielle') NOT NULL DEFAULT 'Automatique',
          \`categorie\` ENUM('SUV', 'Berline', 'Citadine', 'Coupé', 'Cabriolet', 'Break', 'Pick-up', 'Utilitaire', 'Minibus') NOT NULL DEFAULT 'SUV',
          \`etat\` ENUM('neuf', 'occasion', 'occasion_kinshasa', 'occasion_importee') NOT NULL DEFAULT 'occasion',
          \`status\` ENUM('disponible', 'en_attente', 'reserve', 'vendu', 'archive') NOT NULL DEFAULT 'disponible',
          \`en_vedette\` TINYINT(1) NOT NULL DEFAULT 0,
          \`is_sponsored\` TINYINT(1) NOT NULL DEFAULT 0,
          \`listing_tier\` ENUM('standard', 'featured', 'premium') NOT NULL DEFAULT 'standard',
          \`featured_until\` DATETIME DEFAULT NULL,
          \`views_count\` INT UNSIGNED NOT NULL DEFAULT 0,
          \`ville\` VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
          \`commune\` VARCHAR(100) DEFAULT 'Gombe',
          \`description\` TEXT DEFAULT NULL,
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
          CONSTRAINT \`fk_vehicles_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
          INDEX \`idx_vehicles_user_status\` (\`user_id\`, \`status\`, \`deleted_at\`),
          INDEX \`idx_vehicles_marque_modele\` (\`marque\`, \`modele\`),
          INDEX \`idx_vehicles_prix\` (\`prix\`, \`currency\`),
          INDEX \`idx_vehicles_en_vedette\` (\`en_vedette\`, \`featured_until\`),
          INDEX \`idx_vehicles_listing_tier\` (\`listing_tier\`),
          INDEX \`idx_vehicles_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('   ✅ Table `vehicles` créée.');
    } else {
      console.log('🔍 [2/7] Table `vehicles` existante détectée. Analyse des colonnes de monétisation...');
      const vehCols = await getExistingColumns(connection, 'vehicles');

      if (!vehCols.includes('user_id')) {
        console.log('   ⚡ ALTER TABLE `vehicles` ADD `user_id`...');
        await connection.query(`ALTER TABLE \`vehicles\` ADD COLUMN \`user_id\` BIGINT UNSIGNED DEFAULT NULL AFTER \`uuid\``);
        await connection.query(`ALTER TABLE \`vehicles\` ADD CONSTRAINT \`fk_vehicles_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE`);
      }
      if (!vehCols.includes('en_vedette')) {
        console.log('   ⚡ ALTER TABLE `vehicles` ADD `en_vedette`...');
        await connection.query(`ALTER TABLE \`vehicles\` ADD COLUMN \`en_vedette\` TINYINT(1) NOT NULL DEFAULT 0 AFTER \`status\``);
      }
      if (!vehCols.includes('is_sponsored')) {
        console.log('   ⚡ ALTER TABLE `vehicles` ADD `is_sponsored`...');
        await connection.query(`ALTER TABLE \`vehicles\` ADD COLUMN \`is_sponsored\` TINYINT(1) NOT NULL DEFAULT 0 AFTER \`en_vedette\``);
      }
      if (!vehCols.includes('listing_tier')) {
        console.log('   ⚡ ALTER TABLE `vehicles` ADD `listing_tier`...');
        await connection.query(`ALTER TABLE \`vehicles\` ADD COLUMN \`listing_tier\` ENUM('standard', 'featured', 'premium') NOT NULL DEFAULT 'standard' AFTER \`is_sponsored\``);
      }
      if (!vehCols.includes('featured_until')) {
        console.log('   ⚡ ALTER TABLE `vehicles` ADD `featured_until`...');
        await connection.query(`ALTER TABLE \`vehicles\` ADD COLUMN \`featured_until\` DATETIME DEFAULT NULL AFTER \`listing_tier\``);
      }
      console.log('   ✅ Table `vehicles` vérifiée et enrichie pour la monétisation.');
    }

    // -----------------------------------------------------------------
    // 3. TABLE : subscription_plans
    // -----------------------------------------------------------------
    console.log('📦 [3/7] Vérification / Création table `subscription_plans`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`subscription_plans\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`name\` VARCHAR(100) NOT NULL,
        \`target_role\` ENUM('user', 'seller', 'dealer', 'garage') NOT NULL DEFAULT 'seller',
        \`price_usd\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`price_cdf\` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
        \`billing_cycle\` ENUM('monthly', 'yearly', 'lifetime') NOT NULL DEFAULT 'monthly',
        \`max_active_listings\` INT UNSIGNED NOT NULL DEFAULT 3,
        \`max_featured_listings\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`badge_verified\` TINYINT(1) NOT NULL DEFAULT 0,
        \`has_crm_leads\` TINYINT(1) NOT NULL DEFAULT 1,
        \`has_whatsapp_direct\` TINYINT(1) NOT NULL DEFAULT 1,
        \`has_analytics\` TINYINT(1) NOT NULL DEFAULT 0,
        \`features\` JSON DEFAULT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`display_order\` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_sub_plans_code\` (\`code\`),
        INDEX \`idx_sub_plans_active_target\` (\`is_active\`, \`target_role\`, \`display_order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ Table `subscription_plans` prête.');

    // -----------------------------------------------------------------
    // 4. TABLE : user_subscriptions
    // -----------------------------------------------------------------
    console.log('📦 [4/7] Vérification / Création table `user_subscriptions`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`user_subscriptions\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`uuid\` CHAR(36) NOT NULL UNIQUE,
        \`user_id\` BIGINT UNSIGNED NOT NULL,
        \`plan_id\` INT UNSIGNED NOT NULL,
        \`status\` ENUM('pending', 'active', 'past_due', 'canceled', 'expired', 'suspended') NOT NULL DEFAULT 'pending',
        \`billing_cycle\` ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
        \`amount_paid\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`currency\` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
        \`starts_at\` DATETIME NOT NULL,
        \`ends_at\` DATETIME NOT NULL,
        \`canceled_at\` DATETIME DEFAULT NULL,
        \`auto_renew\` TINYINT(1) NOT NULL DEFAULT 1,
        \`max_vehicles_snapshot\` INT UNSIGNED NOT NULL DEFAULT 3,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_usub_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_usub_plan_id\` FOREIGN KEY (\`plan_id\`) REFERENCES \`subscription_plans\` (\`id\`) ON DELETE RESTRICT,
        INDEX \`idx_usub_user_status\` (\`user_id\`, \`status\`),
        INDEX \`idx_usub_ends_status\` (\`ends_at\`, \`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ Table `user_subscriptions` prête.');

    // -----------------------------------------------------------------
    // 5. TABLE : promotions
    // -----------------------------------------------------------------
    console.log('📦 [5/7] Vérification / Création table `promotions`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`promotions\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`uuid\` CHAR(36) NOT NULL UNIQUE,
        \`vehicle_id\` BIGINT UNSIGNED NOT NULL,
        \`user_id\` BIGINT UNSIGNED NOT NULL,
        \`promotion_type\` ENUM('featured', 'sponsored', 'bump', 'badge_premium', 'urgent') NOT NULL DEFAULT 'featured',
        \`duration_days\` SMALLINT UNSIGNED NOT NULL DEFAULT 7,
        \`starts_at\` DATETIME NOT NULL,
        \`ends_at\` DATETIME NOT NULL,
        \`status\` ENUM('pending', 'active', 'expired', 'revoked') NOT NULL DEFAULT 'pending',
        \`price_paid\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`currency\` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_promo_vehicle_id\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_promo_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        INDEX \`idx_promo_vehicle_status\` (\`vehicle_id\`, \`status\`),
        INDEX \`idx_promo_ends_status\` (\`ends_at\`, \`status\`),
        INDEX \`idx_promo_user\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ Table `promotions` prête.');

    // -----------------------------------------------------------------
    // 6. TABLE : advertisements
    // -----------------------------------------------------------------
    console.log('📦 [6/7] Vérification / Création table `advertisements`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`advertisements\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`uuid\` CHAR(36) NOT NULL UNIQUE,
        \`user_id\` BIGINT UNSIGNED DEFAULT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`company_name\` VARCHAR(255) NOT NULL,
        \`advertiser_name\` VARCHAR(255) NOT NULL,
        \`advertiser_email\` VARCHAR(191) DEFAULT NULL,
        \`advertiser_phone\` VARCHAR(50) DEFAULT NULL,
        \`placement\` ENUM('homepage_top', 'catalogue_inline', 'vehicle_detail_sidebar', 'garage_directory', 'footer_banner') NOT NULL DEFAULT 'catalogue_inline',
        \`ad_format\` ENUM('banner_leaderboard', 'banner_inline', 'sidebar_box', 'banner_sos', 'popup') NOT NULL DEFAULT 'banner_inline',
        \`image_url\` VARCHAR(1000) NOT NULL,
        \`target_url\` VARCHAR(500) NOT NULL DEFAULT '#',
        \`cta_text\` VARCHAR(100) NOT NULL DEFAULT 'En savoir plus',
        \`budget_usd\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`impressions_count\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`clicks_count\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`starts_at\` DATE NOT NULL,
        \`ends_at\` DATE NOT NULL,
        \`status\` ENUM('pending', 'active', 'paused', 'expired', 'rejected') NOT NULL DEFAULT 'pending',
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_ads_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
        INDEX \`idx_ads_active_placement\` (\`is_active\`, \`placement\`, \`status\`),
        INDEX \`idx_ads_ends_at\` (\`ends_at\`),
        INDEX \`idx_ads_user\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ Table `advertisements` prête.');

    // -----------------------------------------------------------------
    // 7. TABLE : payments
    // -----------------------------------------------------------------
    console.log('📦 [7/7] Vérification / Création table `payments`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`payments\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`uuid\` CHAR(36) NOT NULL UNIQUE,
        \`transaction_reference\` VARCHAR(100) NOT NULL UNIQUE,
        \`user_id\` BIGINT UNSIGNED NOT NULL,
        \`subscription_id\` BIGINT UNSIGNED DEFAULT NULL,
        \`promotion_id\` BIGINT UNSIGNED DEFAULT NULL,
        \`vehicle_id\` BIGINT UNSIGNED DEFAULT NULL,
        \`advertisement_id\` BIGINT UNSIGNED DEFAULT NULL,
        \`purpose\` ENUM('subscription', 'vehicle_promotion', 'advertisement', 'commission', 'other') NOT NULL,
        \`amount\` DECIMAL(12, 2) NOT NULL,
        \`currency\` ENUM('USD', 'CDF') NOT NULL DEFAULT 'USD',
        \`exchange_rate\` DECIMAL(10, 4) NOT NULL DEFAULT 2850.0000,
        \`payment_method\` ENUM('mpesa', 'orange_money', 'airtel_money', 'afrimoney', 'card_visa_mastercard', 'bank_transfer', 'cash') NOT NULL,
        \`gateway\` VARCHAR(50) NOT NULL DEFAULT 'manual_or_maxicash',
        \`gateway_reference\` VARCHAR(255) DEFAULT NULL,
        \`payer_phone\` VARCHAR(50) DEFAULT NULL,
        \`payer_name\` VARCHAR(255) DEFAULT NULL,
        \`payer_email\` VARCHAR(191) DEFAULT NULL,
        \`status\` ENUM('pending', 'processing', 'completed', 'paid', 'failed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
        \`receipt_url\` VARCHAR(1000) DEFAULT NULL,
        \`notes\` VARCHAR(255) DEFAULT NULL,
        \`metadata\` JSON DEFAULT NULL,
        \`paid_at\` DATETIME DEFAULT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_pay_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_pay_subscription_id\` FOREIGN KEY (\`subscription_id\`) REFERENCES \`user_subscriptions\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_pay_promotion_id\` FOREIGN KEY (\`promotion_id\`) REFERENCES \`promotions\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_pay_vehicle_id\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_pay_ad_id\` FOREIGN KEY (\`advertisement_id\`) REFERENCES \`advertisements\` (\`id\`) ON DELETE SET NULL,
        INDEX \`idx_pay_reference\` (\`transaction_reference\`),
        INDEX \`idx_pay_user_status\` (\`user_id\`, \`status\`),
        INDEX \`idx_pay_status_created\` (\`status\`, \`created_at\`),
        INDEX \`idx_pay_method\` (\`payment_method\`),
        INDEX \`idx_pay_purpose\` (\`purpose\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ Table `payments` prête.');

    // -----------------------------------------------------------------
    // 8. VUES DE RÉTROCOMPATIBILITÉ
    // -----------------------------------------------------------------
    console.log('🔗 Création des vues de compatibilité transparentes...');
    await connection.query('CREATE OR REPLACE VIEW `subscriptions` AS SELECT * FROM `user_subscriptions`');
    await connection.query('CREATE OR REPLACE VIEW `vehicle_boosts` AS SELECT * FROM `promotions`');
    await connection.query('CREATE OR REPLACE VIEW `ad_campaigns` AS SELECT * FROM `advertisements`');
    console.log('   ✅ Vues `subscriptions`, `vehicle_boosts`, `ad_campaigns` créées.');

    // -----------------------------------------------------------------
    // 9. INSERTION DES PLANS PAR DÉFAUT (SEED)
    // -----------------------------------------------------------------
    console.log('🌱 Alimentation de la grille des forfaits par défaut...');
    await connection.query(`
      INSERT INTO \`subscription_plans\` 
        (\`code\`, \`name\`, \`target_role\`, \`price_usd\`, \`price_cdf\`, \`billing_cycle\`, \`max_active_listings\`, \`max_featured_listings\`, \`badge_verified\`, \`has_crm_leads\`, \`has_whatsapp_direct\`, \`has_analytics\`, \`display_order\`) 
      VALUES
        ('free_particulier', 'Particulier Gratuit', 'user', 0.00, 0.00, 'lifetime', 3, 0, 0, 1, 1, 0, 1),
        ('pro_seller', 'Vendeur Pro Indépendant', 'seller', 49.00, 139650.00, 'monthly', 15, 2, 1, 1, 1, 1, 2),
        ('dealer_gold', 'Concessionnaire Gold Showroom', 'dealer', 149.00, 424650.00, 'monthly', 999999, 10, 1, 1, 1, 1, 3),
        ('garage_pro', 'Partenaire Garage & SOS Dépannage', 'garage', 49.00, 139650.00, 'monthly', 0, 0, 1, 1, 1, 1, 4)
      ON DUPLICATE KEY UPDATE 
        \`name\` = VALUES(\`name\`),
        \`price_usd\` = VALUES(\`price_usd\`),
        \`max_active_listings\` = VALUES(\`max_active_listings\`);
    `);
    console.log('   ✅ Forfaits tarifaires initialisés (3 annonces gratuites pour particuliers).');

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n======================================================');
    console.log('🎉 MIGRATION TERMINÉE AVEC SUCCÈS VIA NODE.JS !');
    console.log('Toutes les tables AutoKin sont prêtes et reliées.');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ ERREUR LORS DE LA MIGRATION :', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runMonetizationMigration();
}

module.exports = { runMonetizationMigration };
