const express = require('express');
const router = express.Router();
const dealershipController = require('../controllers/dealershipController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Routes publiques
router.get('/', dealershipController.getDealerships);
router.get('/:id', dealershipController.getDealershipById);

// Routes privées (Concessionnaires et Administrateurs)
router.post('/', verifyToken, requireRole('dealer', 'admin'), dealershipController.createDealership);
router.put('/:id', verifyToken, requireRole('dealer', 'admin'), dealershipController.updateDealership);
router.delete('/:id', verifyToken, requireRole('admin'), dealershipController.deleteDealership);

module.exports = router;
