const express = require('express');
const router = express.Router();
const monetizationController = require('../controllers/monetizationController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// ==========================================
// 1. ROUTES PUBLIQUES (CONSULTATION DES OFFRES & COMMANDES)
// ==========================================

// Obtenir tous les plans et tarifs (annonces, boosts, abonnements, régie pub)
router.get('/plans', monetizationController.getAllPlans);
router.get('/tarifs', monetizationController.getAllPlans); // Alias français

// Récupérer les bannières publicitaires actives pour le site
router.get('/ads', monetizationController.getActiveAds);
router.get('/publicites', monetizationController.getActiveAds); // Alias français
router.post('/ads/:id/click', monetizationController.recordAdClick);

// Demande d'encart publicitaire (devenir annonceur)
router.post('/ads/inquiry', monetizationController.submitAdInquiry);
router.post('/publicites/demande', monetizationController.submitAdInquiry);

// Créer une commande / intention de paiement (extensible pour M-Pesa, etc.)
router.post('/order', monetizationController.createOrder);
router.post('/commander', monetizationController.createOrder);

// Appliquer un surclassement / boost à un véhicule
router.post('/boost-vehicle/:vehicleId', monetizationController.applyBoostToVehicle);

// ==========================================
// 2. ROUTES D'ADMINISTRATION DES MONÉTISATIONS
// ==========================================

// Liste des commandes et revenus de monétisation
router.get('/orders', monetizationController.getOrders);

// Gestion de la régie publicitaire
router.get('/admin/ads', monetizationController.getAdminAdCampaigns);
router.post('/admin/ads', monetizationController.createAdCampaign);
router.put('/admin/ads/:id', monetizationController.updateAdCampaign);
router.delete('/admin/ads/:id', monetizationController.deleteAdCampaign);

module.exports = router;
