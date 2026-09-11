const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

/**
 * ----------------------------------------------------
 * ROUTES D'AUTHENTIFICATION PUBLIQUES
 * ----------------------------------------------------
 */

// 1. Inscription (avec hash bcrypt automatique, rôles : admin, dealer, seller, garage, user)
router.post('/register', authController.register);

// 2. Connexion (vérification bcrypt & génération JWT)
router.post('/login', authController.login);

// 3. Déconnexion (invalidation session)
router.post('/logout', authController.logout);

// 4. Récupération de mot de passe : demande de code/token de réinitialisation
router.post('/forgot-password', authController.forgotPassword);

// 5. Récupération de mot de passe : validation code/token & nouveau mot de passe hashé
router.post('/reset-password', authController.resetPassword);

// Consultation des rôles disponibles sur la plateforme CONGOCAR
router.get('/roles', (req, res) => {
  res.json({
    success: true,
    roles: [
      { id: 'admin', label: 'Super Administrateur', description: 'Accès total à la plateforme, gestion des rôles et paramétrages globaux.' },
      { id: 'dealer', label: 'Concessionnaire Automobile', description: 'Publication de véhicules, gestion de concession, inventaire, CRM leads et facturation.' },
      { id: 'seller', label: 'Commercial / Vendeur Showroom', description: 'Vendeur affilié à une concession, gestion des contacts prospects et véhicules.' },
      { id: 'garage', label: 'Atelier Mécanique / SOS Dépannage', description: 'Référencement dans l\'annuaire SOS Kinshasa, remorquage, devis et interventions.' },
      { id: 'user', label: 'Acheteur / Client Particulier', description: 'Recherche de voitures, comparateur, favoris, demandes d\'essai et devis mécanique.' }
    ]
  });
});

/**
 * ----------------------------------------------------
 * ROUTES D'AUTHENTIFICATION PROTÉGÉES (JWT OBLIGATOIRE)
 * ----------------------------------------------------
 */

// 6. Profil de l'utilisateur connecté via JWT
router.get('/me', authenticateJWT, authController.getMe);

// 7. Modification du profil (nom, téléphone, ville, avatar, et/ou mot de passe)
router.put('/profile', authenticateJWT, authController.updateProfile);

/**
 * ----------------------------------------------------
 * ROUTES D'ADMINISTRATION DES RÔLES (ADMIN SEULEMENT)
 * ----------------------------------------------------
 */

// 8. Liste de tous les utilisateurs (Protection : authenticateJWT + requireRole('admin'))
router.get('/users', authenticateJWT, requireRole('admin'), authController.getUsers);

// 9. Modification du rôle d'un utilisateur (Protection : authenticateJWT + requireRole('admin'))
router.put('/users/:id/role', authenticateJWT, requireRole('admin'), authController.updateUserRole);

module.exports = router;
