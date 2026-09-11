const express = require('express');
const router = express.Router();
const dealershipController = require('../controllers/dealershipController');
const { verifyToken, requireRole } = require('../middleware/auth');

// =========================================================================
// 1. ROUTES DÉDIÉES AU CONCESSIONNAIRE CONNECTÉ (/api/dealers/me/...)
// =========================================================================

// Profil de sa propre concession
router.get('/me', verifyToken, dealershipController.getCurrentDealerProfile);
router.get('/profile', verifyToken, dealershipController.getCurrentDealerProfile);
router.put('/me', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateDealership);
router.put('/profile', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateDealership);

// Gestion de son stock & ajout de véhicules
router.get('/me/stock', verifyToken, requireRole('dealer', 'admin'), dealershipController.getDealerStock);
router.post('/me/vehicles', verifyToken, requireRole('dealer', 'admin'), dealershipController.addDealerVehicle);
router.patch('/stock/:vehicleId', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateStockVehicleStatus);
router.patch('/stock/:vehicleId/status', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateStockVehicleStatus);

// Consultation de ses statistiques
router.get('/me/stats', verifyToken, requireRole('dealer', 'admin'), dealershipController.getDealerStats);

// Réception & consultation des demandes de clients
router.get('/me/inquiries', verifyToken, requireRole('dealer', 'admin'), dealershipController.getDealerInquiries);
router.patch('/inquiries/:inquiryId', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateDealerInquiryStatus);
router.patch('/inquiries/:inquiryId/status', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateDealerInquiryStatus);


// =========================================================================
// 2. ROUTES PUBLIQUES & GÉNÉRALES
// =========================================================================

// Liste des concessions automobiles (avec filtres, recherche, tri, pagination)
router.get('/', dealershipController.getDealerships);

// Création d'une concession (créer son profil)
router.post('/', verifyToken, dealershipController.createDealership);
router.post('/profile', verifyToken, dealershipController.createDealership);

// Détail public d'une concession (profil + véhicules en vitrine)
router.get('/:id', dealershipController.getDealershipById);

// Soumission d'une demande client (essai, devis, reprise, achat) vers la concession
router.post('/:id/inquiries', dealershipController.createCustomerInquiry);
router.post('/:id/contact', dealershipController.createCustomerInquiry);


// =========================================================================
// 3. ROUTES PRIVÉES PAR IDENTIFIANT CONCESSIONNAIRE (:id)
// =========================================================================

// Modification du profil concessionnaire
router.put('/:id', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateDealership);

// Ajout de véhicule au stock de la concession
router.post('/:id/vehicles', verifyToken, requireRole('dealer', 'admin'), dealershipController.addDealerVehicle);

// Gestion du stock
router.get('/:id/stock', verifyToken, requireRole('dealer', 'admin'), dealershipController.getDealerStock);
router.patch('/:id/stock/:vehicleId', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateStockVehicleStatus);
router.patch('/:id/stock/:vehicleId/status', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateStockVehicleStatus);

// Consultation des statistiques de la concession
router.get('/:id/stats', verifyToken, requireRole('dealer', 'admin'), dealershipController.getDealerStats);

// Consultation des demandes clients reçues
router.get('/:id/inquiries', verifyToken, requireRole('dealer', 'admin'), dealershipController.getDealerInquiries);
router.patch('/:id/inquiries/:inquiryId', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateDealerInquiryStatus);

// Suppression d'une concession (Administrateur uniquement)
router.delete('/:id', verifyToken, requireRole('admin'), dealershipController.deleteDealership);

module.exports = router;
