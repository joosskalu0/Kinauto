const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateJWT, optionalJWT, requireRole } = require('../middleware/auth');

/**
 * 1. FAVORIS DE L'UTILISATEUR (doit être placé avant /:id)
 */
router.get('/favorites', authenticateJWT, vehicleController.getUserFavorites);

/**
 * 2. RECHERCHE & LISTE DES VÉHICULES (Public avec détection JWT optionnelle)
 * Supporte : recherche, filtres (marque, prix, etc.), tri, pagination, statut
 */
router.get('/', optionalJWT, vehicleController.getVehicles);

/**
 * 3. DÉTAIL D'UN VÉHICULE & VÉHICULES SIMILAIRES
 */
router.get('/:id', optionalJWT, vehicleController.getVehicleById);
router.get('/:id/similar', optionalJWT, vehicleController.getSimilarVehicles);
router.get('/:id/similaires', optionalJWT, vehicleController.getSimilarVehicles);

/**
 * 4. GESTION DES FAVORIS PAR VÉHICULE
 */
router.post('/:id/favorite', authenticateJWT, vehicleController.toggleFavoriteVehicle);
router.delete('/:id/favorite', authenticateJWT, vehicleController.removeFavoriteVehicle);
router.get('/:id/favorite', authenticateJWT, vehicleController.checkFavoriteVehicle);

/**
 * 5. CRÉATION, MODIFICATION ET STATUT DU VÉHICULE (Protégé)
 * Statuts supportés : pending, approved, rejected, sold, inactive
 */
router.post('/', authenticateJWT, requireRole('dealer', 'seller', 'admin'), vehicleController.createVehicle);
router.put('/:id', authenticateJWT, vehicleController.updateVehicle);
router.patch('/:id/status', authenticateJWT, vehicleController.updateVehicleStatus);
router.put('/:id/status', authenticateJWT, vehicleController.updateVehicleStatus);
router.delete('/:id', authenticateJWT, vehicleController.deleteVehicle);

module.exports = router;
