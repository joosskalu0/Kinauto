const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Configuration du pool de connexions MySQL
 * Optimisé pour les environnements de production (Hostinger, cPanel, Cloud)
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kinimmo_db',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Fonction helper pour exécuter des requêtes préparées avec paramètres
 * @param {string} sql Requête SQL avec placeholders '?'
 * @param {Array} params Paramètres à lier
 * @returns {Promise<Array>}
 */
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('❌ Erreur d\'exécution SQL :', error.message);
    throw error;
  }
};

/**
 * Teste la connexion à MySQL au démarrage
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Connexion MySQL réussie à la base "${process.env.DB_NAME || 'kinimmo_db'}" sur ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('⚠️ Attention : Impossible de se connecter à la base MySQL.');
    console.error(`Détail : ${error.message}`);
    console.error('👉 Vérifiez vos variables DB_HOST, DB_USER, DB_PASSWORD et DB_NAME dans /server/.env');
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
