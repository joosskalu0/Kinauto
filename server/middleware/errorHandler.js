/**
 * Gestionnaire d'erreurs global Express
 * Capture les exceptions non gérées et retourne une réponse JSON standardisée
 */
const errorHandler = (err, req, res, next) => {
  console.error('💥 Erreur attrapée par errorHandler :', err.stack || err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.status || 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Une erreur interne est survenue sur le serveur.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Gestionnaire pour routes non trouvées (404)
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
