const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Inscription & Connexion
router.post('/register', authController.register);
router.post('/login', authController.login);

// Obtenir l'utilisateur connecté
router.get('/me', authenticateJWT, authController.getMe);

module.exports = router;
