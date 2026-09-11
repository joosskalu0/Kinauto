/**
 * Middleware d'autorisation basé sur les rôles (RBAC) pour CONGOCAR
 * Rôles officiels du système : 'admin', 'dealer', 'seller', 'garage', 'user'
 * 
 * @param {...string} allowedRoles Liste des rôles autorisés à accéder à la ressource
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé : authentification requise.'
      });
    }

    const userRole = req.user.role || 'user';

    // Les administrateurs ont tous les droits par défaut
    if (userRole === 'admin' || userRole === 'superadmin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Accès interdit : votre rôle [${userRole}] ne possède pas les permissions requises. Rôles autorisés : [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
  requireRole: authorizeRoles
};

