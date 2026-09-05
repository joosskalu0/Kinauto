const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Route publique (ou authentifiée si connectée) pour soumettre une demande (essai, reprise, devis, prix)
router.post('/', (req, res, next) => {
  // Optionnel : vérifier si un token est présent sans bloquer si absent
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
}, leadController.createLead);

// Routes protégées pour les concessionnaires et administrateurs
router.get('/', verifyToken, requireRole('dealer', 'salesperson', 'admin'), leadController.getLeads);
router.put('/:id/status', verifyToken, requireRole('dealer', 'admin'), leadController.updateLeadStatus);

module.exports = router;
