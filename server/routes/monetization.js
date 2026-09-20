const express = require('express');
const router = express.Router();
const monetizationController = require('../controllers/monetizationController');
const { authenticateJWT, optionalAuth } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// =========================================================================
// 1. ANNONCES GRATUITES & QUOTAS UTILISATEURS
// =========================================================================
// Vérifier le quota d'annonces gratuites restantes (limite 3 pour particuliers)
router.get('/user-quota', authenticateJWT, monetizationController.getUserQuota);

// =========================================================================
// 2. CONFIGURATION GÉNÉRALE & GRILLES TARIFAIRES (PUBLIQUE)
// =========================================================================
router.get('/plans', monetizationController.getAllPlans);
router.get('/tarifs', monetizationController.getAllPlans);
router.get('/config', monetizationController.getMonetizationConfig);

// =========================================================================
// 3. ANNONCES PREMIUM & VISIBILITÉ (OPTIONS 3, 7, 15, 30 JOURS)
// =========================================================================
// Initier une demande de mise en avant (sécurisée : prix vérifié côté serveur, statut PENDING)
router.post('/promote-vehicle', authenticateJWT, monetizationController.promoteVehicle);
router.post('/boost-vehicle/:vehicleId', authenticateJWT, monetizationController.promoteVehicle);

// =========================================================================
// 4. ABONNEMENTS PROFESSIONNELS (CONCESSIONS, VENDEURS PRO, GARAGES)
// =========================================================================
router.post('/subscribe', authenticateJWT, monetizationController.subscribePlan);
router.post('/order', authenticateJWT, monetizationController.createOrder);
router.post('/commander', authenticateJWT, monetizationController.createOrder);

// =========================================================================
// 5. GESTION DES PAIEMENTS (ADMINISTRATION & TRAÇABILITÉ)
// =========================================================================
// Consulter le statut d'un paiement (public ou utilisateur pour polling)
router.get('/payments/:id/status', optionalAuth, monetizationController.getPaymentStatus);

// Vérifier et valider un paiement côté serveur (sécurisé, active la mise à la une)
router.post('/payments/:id/verify', optionalAuth, monetizationController.verifyPayment);

// Consulter tous les paiements (PENDING, PAID, FAILED, CANCELLED, EXPIRED)
router.get('/payments', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.getPayments);

// Confirmer manuellement un paiement -> ACTIVE LE BOOST OU L'ABONNEMENT
router.post('/payments/:id/confirm', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.confirmPayment);

// Rejeter ou annuler un paiement -> N'ACTIVE RIEN
router.post('/payments/:id/reject', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.rejectPayment);

// =========================================================================
// 6. SUIVI DES BOOSTS ACTIFS & RÉVOCATION (ADMIN)
// =========================================================================
router.get('/boosts', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.getActiveVehicleBoosts);
router.post('/boosts/:id/revoke', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.revokeVehicleBoost);

// =========================================================================
// 7. AUTOMATISATION DES EXPIRATIONS (CRON JOB OU APPEL SYSTÈME)
// =========================================================================
// Expirer les boosts, réinitialiser en statut normal sans supprimer le véhicule, expirer les pubs
router.post('/cleanup-expired', monetizationController.cleanupExpiredMonetization);

// =========================================================================
// 8. TABLEAU DE BORD STATISTIQUES & REVENUS (ADMIN)
// =========================================================================
router.get('/admin/stats', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.getAdminStats);
router.get('/orders', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.getOrders);

// =========================================================================
// 9. RÉGIE PUBLICITAIRE & BANNIÈRES
// =========================================================================
// Affichage public des bannières actives selon l'emplacement
router.get('/ads', monetizationController.getActiveAds);
router.get('/publicites', monetizationController.getActiveAds);
router.post('/ads/:id/click', monetizationController.recordAdClick);

// Demande d'encart pub
router.post('/ads/inquiry', monetizationController.submitAdInquiry);
router.post('/publicites/demande', monetizationController.submitAdInquiry);

// Gestion administrative des campagnes publicitaires
router.get('/admin/ads', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.getAdminAdCampaigns);
router.post('/admin/ads', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.createAdCampaign);
router.put('/admin/ads/:id', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.updateAdCampaign);
router.delete('/admin/ads/:id', authenticateJWT, authorizeRoles('admin', 'superadmin'), monetizationController.deleteAdCampaign);

module.exports = router;
