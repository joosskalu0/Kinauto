const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

/**
 * PROTECTION STRICTE DU PANNEAU D'ADMINISTRATION :
 * Toutes les routes définies ci-dessous exigent impérativement :
 * 1. Un token JWT valide (authenticateJWT)
 * 2. Le rôle 'admin' (authorizeRoles('admin'))
 */
router.use(authenticateJWT);
router.use(authorizeRoles('admin'));

// ==========================================
// 1. STATISTIQUES & TABLEAU DE BORD
// ==========================================
router.get('/stats', adminController.getStats);

// ==========================================
// 2. GESTION DES UTILISATEURS
// ==========================================
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// ==========================================
// 3. GESTION DES VÉHICULES & VALIDATION DES ANNONCES
// ==========================================
router.get('/vehicles', adminController.getAllVehicles);
router.get('/vehicles/:id', adminController.getVehicleById);
router.put('/vehicles/:id/approve', adminController.approveVehicle);
router.put('/vehicles/:id/reject', adminController.rejectVehicle);
router.put('/vehicles/:id', adminController.updateVehicle);
router.delete('/vehicles/:id', adminController.deleteVehicle);

// ==========================================
// 4. GESTION DES CONCESSIONNAIRES (DEALERS)
// ==========================================
router.get('/dealers', adminController.getAllDealers);
router.get('/dealerships', adminController.getAllDealers); // Alias
router.post('/dealers', adminController.createDealer);
router.get('/dealers/:id', adminController.getDealerById);
router.put('/dealers/:id', adminController.updateDealer);
router.put('/dealers/:id/verify', adminController.toggleVerifyDealer);
router.delete('/dealers/:id', adminController.deleteDealer);

// ==========================================
// 5. GESTION DES GARAGES & SOS DÉPANNAGE
// ==========================================
router.get('/garages', adminController.getAllGarages);
router.get('/garages/:id', adminController.getGarageById);
router.put('/garages/:id/approve', adminController.approveGarage);
router.put('/garages/:id/reject', adminController.rejectGarage);
router.put('/garages/:id', adminController.updateGarage);
router.delete('/garages/:id', adminController.deleteGarage);

// ==========================================
// 6. GESTION DES MARQUES (BRANDS)
// ==========================================
router.get('/marques', adminController.getAllBrands);
router.get('/brands', adminController.getAllBrands); // Alias
router.get('/marques/:id', adminController.getBrandById);
router.get('/brands/:id', adminController.getBrandById); // Alias
router.post('/marques', adminController.createBrand);
router.post('/brands', adminController.createBrand); // Alias
router.put('/marques/:id', adminController.updateBrand);
router.put('/brands/:id', adminController.updateBrand); // Alias
router.delete('/marques/:id', adminController.deleteBrand);
router.delete('/brands/:id', adminController.deleteBrand); // Alias

// ==========================================
// 7. GESTION DES MODÈLES (MODELS)
// ==========================================
router.get('/modeles', adminController.getAllModels);
router.get('/models', adminController.getAllModels); // Alias
router.get('/modeles/:id', adminController.getModelById);
router.get('/models/:id', adminController.getModelById); // Alias
router.post('/modeles', adminController.createModel);
router.post('/models', adminController.createModel); // Alias
router.put('/modeles/:id', adminController.updateModel);
router.put('/models/:id', adminController.updateModel); // Alias
router.delete('/modeles/:id', adminController.deleteModel);
router.delete('/models/:id', adminController.deleteModel); // Alias

// ==========================================
// 8. GESTION DES SIGNALEMENTS (REPORTS)
// ==========================================
router.get('/reports', adminController.getAllReports);
router.get('/signalements', adminController.getAllReports); // Alias
router.get('/reports/:id', adminController.getReportById);
router.get('/signalements/:id', adminController.getReportById); // Alias
router.post('/reports', adminController.createReport);
router.post('/signalements', adminController.createReport); // Alias
router.put('/reports/:id/status', adminController.updateReportStatus);
router.put('/reports/:id/resolve', adminController.updateReportStatus); // Alias
router.put('/signalements/:id/status', adminController.updateReportStatus); // Alias
router.delete('/reports/:id', adminController.deleteReport);
router.delete('/signalements/:id', adminController.deleteReport); // Alias

// ==========================================
// 9. GESTION DES ABONNEMENTS (SUBSCRIPTIONS & PLANS)
// ==========================================
router.get('/subscriptions', adminController.getAllSubscriptions);
router.get('/abonnements', adminController.getAllSubscriptions); // Alias
router.get('/subscriptions/plans', adminController.getSubscriptionPlans);
router.get('/plans', adminController.getSubscriptionPlans); // Alias
router.post('/subscriptions', adminController.createSubscription);
router.post('/abonnements', adminController.createSubscription); // Alias
router.put('/subscriptions/:id', adminController.updateSubscription);
router.put('/abonnements/:id', adminController.updateSubscription); // Alias
router.delete('/subscriptions/:id', adminController.deleteSubscription);
router.delete('/abonnements/:id', adminController.deleteSubscription); // Alias

// ==========================================
// 10. GESTION DES PAIEMENTS (PAYMENTS & TRANSACTIONS)
// ==========================================
router.get('/payments', adminController.getAllPayments);
router.get('/paiements', adminController.getAllPayments); // Alias
router.get('/payments/:id', adminController.getPaymentById);
router.get('/paiements/:id', adminController.getPaymentById); // Alias
router.post('/payments', adminController.createPayment);
router.post('/paiements', adminController.createPayment); // Alias
router.put('/payments/:id/status', adminController.updatePaymentStatus);
router.put('/paiements/:id/status', adminController.updatePaymentStatus); // Alias

module.exports = router;
