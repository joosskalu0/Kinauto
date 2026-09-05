const express = require('express');
const router = express.Router();
const garageController = require('../controllers/garageController');
const { authenticateJWT, optionalJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// Routes publiques pour les automobilistes
router.get('/', garageController.getAllGarages);
router.get('/:id', garageController.getGarageById);

// Déclencher une demande SOS dépannage en urgence (ouvert au public)
router.post('/sos-breakdown', optionalJWT, garageController.createBreakdownRequest);

// Création d'un garage certifié
router.post('/', authenticateJWT, authorizeRoles('agent', 'agency', 'admin'), garageController.createGarage);

// Gestion des interventions SOS dépannage
router.get('/sos/requests', authenticateJWT, garageController.getBreakdownRequests);
router.put('/sos/requests/:id/status', authenticateJWT, garageController.updateBreakdownStatus);

module.exports = router;
