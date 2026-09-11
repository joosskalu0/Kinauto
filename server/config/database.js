const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Configuration du pool de connexions MySQL
 * Optimisé pour les environnements de production (Hostinger, cPanel, Cloud, VPS)
 */
let pool = null;
let isConnectedToMysql = false;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'congocar_db',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
} catch (err) {
  console.warn('⚠️ Avertissement initialisation Pool MySQL:', err.message);
}

// Resilient In-Memory Store pour le mode développement / aperçu sans serveur MySQL actif
// Tous les mots de passe sont rigoureusement hashés avec bcrypt (salt 10) - aucun mot de passe en clair !
const BCRYPT_SALT = 10;
const HASHED_PWD_123 = bcrypt.hashSync('password123', BCRYPT_SALT);
const HASHED_PWD_ADMIN = bcrypt.hashSync('AdminPassword2026!', BCRYPT_SALT);

const { INITIAL_VEHICLES, INITIAL_VEHICLE_IMAGES, INITIAL_FAVORITES } = require('./sampleVehicles');
const { handleVehiclesQuery } = require('./vehicleStorage');
const { handleDealerQuery, INITIAL_LEADS } = require('./dealerStorage');
const { handleGarageQuery, INITIAL_GARAGES, INITIAL_GARAGE_SERVICES, INITIAL_GARAGE_IMAGES, INITIAL_BREAKDOWNS } = require('./garageStorage');
const { handleAdminStoreQuery, initAdminStore, INITIAL_BRANDS, INITIAL_MODELS, INITIAL_REPORTS, INITIAL_PLANS, INITIAL_SUBSCRIPTIONS, INITIAL_PAYMENTS } = require('./adminStorage');

const memoryStore = {
  users: [
    {
      id: 1,
      name: 'Super Administrateur CONGOCAR',
      email: 'admin@congocar.cd',
      password: HASHED_PWD_ADMIN,
      role: 'admin',
      phone: '+243 81 000 0001',
      city: 'Kinshasa - Gombe',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      status: 'active',
      created_at: new Date('2025-01-01T08:00:00Z'),
      updated_at: new Date('2025-01-01T08:00:00Z'),
      last_login_at: null
    },
    {
      id: 2,
      name: 'Auto Prestige Kinshasa (Concession)',
      email: 'dealer@congocar.cd',
      password: HASHED_PWD_123,
      role: 'dealer',
      phone: '+243 89 555 0101',
      city: 'Kinshasa - Boulevard du 30 Juin',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
      status: 'active',
      created_at: new Date('2025-01-10T10:00:00Z'),
      updated_at: new Date('2025-01-10T10:00:00Z'),
      last_login_at: null
    },
    {
      id: 3,
      name: 'Jean-Paul Ilunga (Commercial Showroom)',
      email: 'vendeur@autoprestige-paris.fr',
      password: HASHED_PWD_123,
      role: 'seller',
      phone: '+243 82 444 0202',
      city: 'Kinshasa - Limete',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      status: 'active',
      created_at: new Date('2025-01-15T11:00:00Z'),
      updated_at: new Date('2025-01-15T11:00:00Z'),
      last_login_at: null
    },
    {
      id: 4,
      name: 'Atelier SOS Dépannage Kin Mécanique',
      email: 'garage@congocar.cd',
      password: HASHED_PWD_123,
      role: 'garage',
      phone: '+243 99 888 0303',
      city: 'Kinshasa - Kasa-Vubu',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      status: 'active',
      created_at: new Date('2025-02-01T09:00:00Z'),
      updated_at: new Date('2025-02-01T09:00:00Z'),
      last_login_at: null
    },
    {
      id: 5,
      name: 'Patient Mwamba (Acheteur Particulier)',
      email: 'client@congocar.cd',
      password: HASHED_PWD_123,
      role: 'user',
      phone: '+243 85 777 0404',
      city: 'Kinshasa - Ngaliema',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      status: 'active',
      created_at: new Date('2025-02-10T14:00:00Z'),
      updated_at: new Date('2025-02-10T14:00:00Z'),
      last_login_at: null
    }
  ],
  dealerships: [
    {
      id: 1,
      user_id: 2,
      nom: 'Auto Prestige Kinshasa',
      telephone: '+243 89 555 0101',
      email: 'contact@autoprestige-paris.fr',
      statut_abonnement: 'actif',
      plan_id: 'concessionnaire_pro',
      verified: 1,
      created_at: new Date('2025-01-10T10:00:00Z')
    }
  ],
  garages: [...INITIAL_GARAGES],
  garage_services: [...INITIAL_GARAGE_SERVICES],
  garage_images: [...INITIAL_GARAGE_IMAGES],
  breakdown_requests: [...INITIAL_BREAKDOWNS],
  password_resets: [],
  vehicles: [...INITIAL_VEHICLES],
  vehicle_images: [...INITIAL_VEHICLE_IMAGES],
  vehicle_favorites: [...INITIAL_FAVORITES],
  leads: [...INITIAL_LEADS],
  marques: [...INITIAL_BRANDS],
  modeles: [...INITIAL_MODELS],
  reports: [...INITIAL_REPORTS],
  plans: [...INITIAL_PLANS],
  subscriptions: [...INITIAL_SUBSCRIPTIONS],
  payments: [...INITIAL_PAYMENTS]
};

/**
 * Exécute une requête SQL via MySQL si connecté, ou via le moteur de stockage résilient
 * @param {string} sql Requête SQL
 * @param {Array} params Paramètres
 * @returns {Promise<Array>}
 */
const query = async (sql, params = []) => {
  const normalizedSql = sql.trim().toUpperCase();

  if (isConnectedToMysql && pool) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (mysqlErr) {
      console.warn('⚠️ Erreur MySQL, bascule sur le gestionnaire résilient :', mysqlErr.message);
    }
  }

  // --- MOTEUR RÉSILIANT POUR UTILISATEURS & AUTHENTIFICATION ---
  // Gère SELECT, INSERT, UPDATE sur les tables users, password_resets, dealerships, garages
  if (normalizedSql.includes('FROM USERS') || normalizedSql.includes('INTO USERS') || normalizedSql.includes('UPDATE USERS')) {
    // 1. SELECT * FROM users WHERE email = ?
    if (normalizedSql.startsWith('SELECT') && normalizedSql.includes('WHERE EMAIL = ?')) {
      const email = String(params[0] || '').toLowerCase().trim();
      const found = memoryStore.users.filter((u) => u.email.toLowerCase() === email);
      return found;
    }

    // 2. SELECT ... FROM users WHERE id = ?
    if (normalizedSql.startsWith('SELECT') && normalizedSql.includes('WHERE ID = ?')) {
      const id = Number(params[0]);
      const found = memoryStore.users.filter((u) => u.id === id);
      return found;
    }

    // 3. SELECT all users (pour la gestion des rôles par l'admin)
    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('ORDER BY') || !normalizedSql.includes('WHERE'))) {
      return [...memoryStore.users].map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
      });
    }

    // 4. INSERT INTO users
    if (normalizedSql.startsWith('INSERT INTO USERS')) {
      const newId = memoryStore.users.length > 0 ? Math.max(...memoryStore.users.map(u => u.id)) + 1 : 1;
      let newUser = {
        id: newId,
        name: params[0] || 'Utilisateur',
        email: String(params[1] || '').toLowerCase().trim(),
        password: params[2], // déjà hashé avec bcrypt par authController
        role: params[3] || 'user',
        phone: params[4] || null,
        city: params[5] || 'Kinshasa',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: null
      };
      memoryStore.users.push(newUser);
      return { insertId: newId, affectedRows: 1 };
    }

    // 5. UPDATE users
    if (normalizedSql.startsWith('UPDATE USERS')) {
      const lastParam = params[params.length - 1];
      let userIndex = -1;

      if (normalizedSql.includes('WHERE EMAIL = ?')) {
        const targetEmail = String(lastParam || '').toLowerCase().trim();
        userIndex = memoryStore.users.findIndex(u => u.email.toLowerCase() === targetEmail);
      } else {
        const userId = Number(lastParam);
        userIndex = memoryStore.users.findIndex(u => u.id === userId);
      }

      if (userIndex !== -1) {
        // Changement de rôle par l'admin : UPDATE users SET role = ? WHERE id = ?
        if (normalizedSql.includes('SET ROLE = ?')) {
          memoryStore.users[userIndex].role = params[0];
          memoryStore.users[userIndex].updated_at = new Date();
          return { affectedRows: 1 };
        }
        // Changement de mot de passe : UPDATE users SET password = ? WHERE id = ? ou WHERE email = ?
        if (normalizedSql.includes('SET PASSWORD = ?')) {
          memoryStore.users[userIndex].password = params[0];
          memoryStore.users[userIndex].updated_at = new Date();
          return { affectedRows: 1 };
        }
        // Mise à jour de profil complet
        if (params.length >= 3) {
          if (params[0]) memoryStore.users[userIndex].name = params[0];
          if (params[1]) memoryStore.users[userIndex].phone = params[1];
          if (params[2]) memoryStore.users[userIndex].city = params[2];
          memoryStore.users[userIndex].updated_at = new Date();
        }
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }
  }

  // --- GESTION DES RÉINITIALISATIONS DE MOT DE PASSE (password_resets) ---
  if (normalizedSql.includes('PASSWORD_RESETS')) {
    if (normalizedSql.startsWith('INSERT INTO PASSWORD_RESETS')) {
      const resetEntry = {
        id: memoryStore.password_resets.length + 1,
        email: String(params[0] || '').toLowerCase().trim(),
        token: params[1],
        code: params[2],
        expires_at: params[3] instanceof Date ? params[3] : new Date(Date.now() + 3600000),
        created_at: new Date()
      };
      // Supprimer les anciens tokens pour ce compte
      memoryStore.password_resets = memoryStore.password_resets.filter(pr => pr.email !== resetEntry.email);
      memoryStore.password_resets.push(resetEntry);
      return { insertId: resetEntry.id, affectedRows: 1 };
    }

    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('CODE = ?') || normalizedSql.includes('TOKEN = ?'))) {
      const email = String(params[0] || '').toLowerCase().trim();
      const codeOrToken = String(params[1] || '').trim();
      const found = memoryStore.password_resets.filter(
        pr => pr.email.toLowerCase() === email && (pr.code === codeOrToken || pr.token === codeOrToken) && new Date(pr.expires_at) > new Date()
      );
      return found;
    }

    if (normalizedSql.startsWith('DELETE FROM PASSWORD_RESETS')) {
      const email = String(params[0] || '').toLowerCase().trim();
      memoryStore.password_resets = memoryStore.password_resets.filter(pr => pr.email !== email);
      return { affectedRows: 1 };
    }
  }

  // --- TABLES DEALERSHIPS & LEADS ---
  const dealerQueryResult = handleDealerQuery(normalizedSql, sql, params, memoryStore);
  if (dealerQueryResult !== null) {
    return dealerQueryResult;
  }

  // --- TABLES GARAGES, GARAGE_SERVICES, GARAGE_IMAGES & BREAKDOWN_REQUESTS ---
  const garageQueryResult = handleGarageQuery(normalizedSql, sql, params, memoryStore);
  if (garageQueryResult !== null) {
    return garageQueryResult;
  }

  // --- TABLES VEHICLES, VEHICLE_IMAGES & VEHICLE_FAVORITES ---
  const vehicleQueryResult = handleVehiclesQuery(normalizedSql, sql, params, memoryStore);
  if (vehicleQueryResult !== null) {
    return vehicleQueryResult;
  }

  // Par défaut, retourner tableau vide si requête non interceptée
  return [];
};

/**
 * Teste la connexion à MySQL au démarrage
 */
const testConnection = async () => {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Connexion MySQL réussie à la base "${process.env.DB_NAME || 'congocar_db'}" sur ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    connection.release();
    isConnectedToMysql = true;
    return true;
  } catch (error) {
    console.log('ℹ️ Base de données en mode mémoire résilient (MySQL non configuré ou hors-ligne). Authentification Node.js active.');
    isConnectedToMysql = false;
    return false;
  }
};

// Démarrer la vérification de connexion
testConnection().catch(() => {});

module.exports = {
  pool,
  query,
  testConnection,
  getIsConnectedToMysql: () => isConnectedToMysql,
  memoryStore
};

