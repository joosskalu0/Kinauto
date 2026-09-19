const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection, pool } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Charger les variables d'environnement (.env)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS (autoriser les requêtes frontend)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middlewares d'analyse du corps des requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de bienvenue et santé de l'API
app.get('/', (req, res) => {
  res.json({
    name: 'Plateforme SaaS Concessions Automobiles & Garages API',
    version: '2.0.0',
    status: 'online',
    database: 'MySQL',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      dealerships: '/api/dealerships',
      vehicles: '/api/vehicles',
      leads: '/api/leads',
      favorites: '/api/favorites',
      garages: '/api/garages',
      users: '/api/users',
      admin: '/api/admin'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Dealership & Automotive API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/test-db', async (req, res) => {
  const startTime = Date.now();
  try {
    if (!pool) {
      console.warn('[MySQL Test DB] ⚠️ Pool MySQL non initialisé.');
      return res.status(503).json({
        success: false,
        connected: false,
        message: 'Pool MySQL non initialisé.'
      });
    }
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 AS connected, NOW() AS server_time, VERSION() AS mysql_version');
    connection.release();
    const latencyMs = Date.now() - startTime;
    console.log(`[MySQL Test DB] ✅ Test de connexion MySQL RÉUSSI (${latencyMs}ms) :`, rows);
    return res.json({
      success: true,
      connected: true,
      message: 'Connexion active à la base de données MySQL vérifiée avec succès.',
      latency_ms: latencyMs,
      database: process.env.DB_NAME || 'congocar_db',
      server_info: rows
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.error(`[MySQL Test DB] ❌ Résultat du test de connexion MySQL (${latencyMs}ms) : ${error.message}`);
    return res.status(500).json({
      success: false,
      connected: false,
      message: 'Échec de la connexion active à la base de données MySQL.',
      error: error.message,
      latency_ms: latencyMs
    });
  }
});

// Importation des routes concessionnaires et garages
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dealershipRoutes = require('./routes/dealerships');
const vehicleRoutes = require('./routes/vehicles');
const leadRoutes = require('./routes/leads');
const favoriteRoutes = require('./routes/favorites');
const garageRoutes = require('./routes/garages');
const adminRoutes = require('./routes/admin');
const monetizationRoutes = require('./routes/monetization');

// Montage des routes sous le préfixe /api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dealerships', dealershipRoutes);
app.use('/api/dealers', dealershipRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/garages', garageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/monetisation', monetizationRoutes);

// Alias de rétrocompatibilité
app.use('/api/agencies', dealershipRoutes);
app.use('/api/properties', vehicleRoutes);
app.use('/api/messages', leadRoutes);

// Gestion des routes 404
app.use(notFoundHandler);

// Middleware global de gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur et test de connexion à la base de données
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`=======================================================`);
  console.log(`🚗 Backend Concessionnaires Automobiles & Garages démarré !`);
  console.log(`📡 URL Locale : http://localhost:${PORT}`);
  console.log(`🌍 Prêt pour déploiement Hostinger sur le port : ${PORT}`);
  console.log(`=======================================================`);
  
  // Test de connexion MySQL
  await testConnection();
});

module.exports = app;
