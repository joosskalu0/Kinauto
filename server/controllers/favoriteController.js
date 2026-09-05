const { query } = require('../config/database');

/**
 * @route   GET /api/favorites
 * @desc    Lister tous les véhicules sauvegardés en favoris par l'utilisateur connecté
 * @access  Privé
 */
const getUserFavorites = async (req, res, next) => {
  try {
    const favorites = await query(`
      SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        v.*,
        (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = v.id ORDER BY vi.is_primary DESC, vi.display_order ASC LIMIT 1) as primary_image,
        COALESCE(d.nom, '') as dealership_nom,
        COALESCE(d.ville, '') as dealership_ville
      FROM vehicle_favorites f
      JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN dealerships d ON v.dealership_id = d.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      count: favorites.length,
      favorites
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/favorites/:vehicleId
 * @desc    Ajouter un véhicule aux favoris
 * @access  Privé
 */
const addFavorite = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    // Vérifier que le véhicule existe
    const veh = await query('SELECT id FROM vehicles WHERE id = ? LIMIT 1', [vehicleId]);
    if (veh.length === 0) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    // Insérer (ou ignorer si déjà présent)
    await query(
      'INSERT IGNORE INTO vehicle_favorites (user_id, vehicle_id, created_at) VALUES (?, ?, NOW())',
      [req.user.id, vehicleId]
    );

    res.status(201).json({
      success: true,
      message: 'Véhicule ajouté aux favoris.',
      vehicleId: Number(vehicleId)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/favorites/:vehicleId
 * @desc    Retirer un véhicule des favoris
 * @access  Privé
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    const result = await query(
      'DELETE FROM vehicle_favorites WHERE user_id = ? AND vehicle_id = ?',
      [req.user.id, vehicleId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Ce véhicule n\'était pas dans vos favoris.' });
    }

    res.json({
      success: true,
      message: 'Véhicule retiré des favoris.',
      vehicleId: Number(vehicleId)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/favorites/check/:vehicleId
 * @desc    Vérifier si un véhicule est dans les favoris de l'utilisateur
 * @access  Privé
 */
const checkFavorite = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    const fav = await query(
      'SELECT id FROM vehicle_favorites WHERE user_id = ? AND vehicle_id = ? LIMIT 1',
      [req.user.id, vehicleId]
    );

    res.json({
      success: true,
      isFavorite: fav.length > 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
};
