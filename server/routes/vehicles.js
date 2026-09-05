const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Routes publiques
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Routes protégées (Création, modification, suppression par concessionnaire ou admin)
router.post('/', verifyToken, requireRole('dealer', 'admin'), vehicleController.createVehicle);
router.put('/:id', verifyToken, requireRole('dealer', 'admin'), vehicleController.updateVehicle);
router.delete('/:id', verifyToken, requireRole('dealer', 'admin'), vehicleController.deleteVehicle);

module.exports = router;
