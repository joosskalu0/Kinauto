const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/auth');

// Profil utilisateur
router.get('/profile', authenticateJWT, userController.getProfile);
router.put('/profile', authenticateJWT, userController.updateProfile);
router.put('/change-password', authenticateJWT, userController.changePassword);

module.exports = router;
