const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateJWT } = require('../middleware/auth');

// Toutes les routes favoris nécessitent d'être connecté
router.use(authenticateJWT);

router.get('/', favoriteController.getUserFavorites);
router.post('/:vehicleId', favoriteController.addFavorite);
router.delete('/:vehicleId', favoriteController.removeFavorite);
router.get('/check/:vehicleId', favoriteController.checkFavorite);

module.exports = router;
