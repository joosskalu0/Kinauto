const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification JWT
 * Vérifie le Bearer Token présent dans le header 'Authorization'
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé : aucun jeton d\'authentification (Token) fourni.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Format du jeton invalide. Utilisez "Bearer <token>".'
    });
  }

  const token = parts[1];

  try {
    const secret = process.env.JWT_SECRET || 'autoconcession_default_secret_key_jwt_2026';
    const decoded = jwt.verify(token, secret);

    // Attachement des informations de l'utilisateur à la requête
    req.user = decoded; // Contient { id, email, role, name, ... }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expirée : veuillez vous reconnecter.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Jeton d\'authentification invalide.'
    });
  }
};

/**
 * Middleware d'authentification optionnelle
 */
const optionalJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      const secret = process.env.JWT_SECRET || 'autoconcession_default_secret_key_jwt_2026';
      req.user = jwt.verify(parts[1], secret);
    } catch {
      req.user = null;
    }
  }
  next();
};

/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôles requis : ${roles.join(' ou ')}.`
      });
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  verifyToken: authenticateJWT,
  optionalJWT,
  requireRole
};
