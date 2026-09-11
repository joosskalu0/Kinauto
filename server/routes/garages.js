const express = require('express');
const router = express.Router();
const garageController = require('../controllers/garageController');
const { authenticateJWT, optionalJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// ====================================================================
// 1. ROUTES PUBLIQUES (Automobilistes, Recherche & Profils)
// ====================================================================

// Liste des garages certifiés avec filtres (commune, ville, 24/7, recherche)
router.get('/', garageController.getAllGarages);

// Déclencher une demande SOS dépannage d'urgence (ouvert au public)
router.post('/sos-breakdown', optionalJWT, garageController.createBreakdownRequest);

// ====================================================================
// 2. ROUTES ESPACE GARAGISTE CONNECTÉ (/me)
// ====================================================================

// Profil du garage de l'utilisateur connecté
router.get('/me', authenticateJWT, garageController.getMyGarageProfile);

// Modifier le profil du garage connecté
router.put('/me', authenticateJWT, garageController.updateGarage);

// Ajouter un service à son garage connecté
router.post('/me/services', authenticateJWT, garageController.addGarageService);

// Ajouter une photo à son garage connecté
router.post('/me/photos', authenticateJWT, garageController.addGaragePhoto);

// ====================================================================
// 3. INSCRIPTION D'UN NOUVEAU GARAGE (Validation admin requise par défaut)
// ====================================================================
router.post('/register', authenticateJWT, garageController.createGarage);
router.post('/', authenticateJWT, garageController.createGarage);

// ====================================================================
// 4. CONSULTATION & MODIFICATION PAR ID
// ====================================================================

// Fiche détaillée d'un garage avec ses services et photos
router.get('/:id', garageController.getGarageById);

// Modifier les informations d'un garage (gérant ou admin)
router.put('/:id', authenticateJWT, garageController.updateGarage);

// ====================================================================
// 5. VALIDATION ADMINISTRATIVE D'UN GARAGE (RÉSERVÉ ADMIN)
// ====================================================================
router.patch('/:id/validate', authenticateJWT, authorizeRoles('admin'), garageController.validateGarage);
router.patch('/:id/status', authenticateJWT, authorizeRoles('admin'), garageController.validateGarage);

// ====================================================================
// 6. GESTION DES SERVICES DU GARAGE
// ====================================================================
router.get('/:id/services', garageController.getGarageServices);
router.post('/:id/services', authenticateJWT, garageController.addGarageService);
router.delete('/services/:serviceId', authenticateJWT, garageController.deleteGarageService);

// ====================================================================
// 7. GESTION DES PHOTOS DE L'ATELIER
// ====================================================================
router.get('/:id/photos', garageController.getGaragePhotos);
router.post('/:id/photos', authenticateJWT, garageController.addGaragePhoto);
router.delete('/photos/:photoId', authenticateJWT, garageController.deleteGaragePhoto);

// ====================================================================
// 8. SUIVI DES INTERVENTIONS SOS DÉPANNAGE
// ====================================================================
router.get('/sos/requests', authenticateJWT, garageController.getBreakdownRequests);
router.get('/sos-breakdown/list', authenticateJWT, garageController.getBreakdownRequests);
router.put('/sos/requests/:id/status', authenticateJWT, garageController.updateBreakdownStatus);
router.put('/sos-breakdown/:id/status', authenticateJWT, garageController.updateBreakdownStatus);

module.exports = router;
