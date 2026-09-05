const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// Protection stricte : toutes les routes de ce fichier exigent un compte avec le rôle 'admin'
router.use(authenticateJWT);
router.use(authorizeRoles('admin'));

// Statistiques & Dashboard
router.get('/stats', adminController.getStats);

// Gestion des utilisateurs
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Modération et mise en avant
router.put('/properties/:id/featured', adminController.togglePropertyFeatured);
router.put('/agencies/:id/verify', adminController.toggleAgencyVerified);

module.exports = router;
