/**
 * Middleware d'autorisation basé sur les rôles (RBAC)
 * Rôles acceptés dans Kinimmo : 'user', 'agent', 'agency', 'admin'
 * 
 * @param  {...string} allowedRoles Liste des rôles autorisés à accéder à la ressource
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié.'
      });
    }

    const userRole = req.user.role || 'user';

    // Les administrateurs ont tous les droits
    if (userRole === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Accès interdit : ce rôle (${userRole}) n'a pas les permissions requises. Rôles acceptés : [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
