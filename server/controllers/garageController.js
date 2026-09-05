const { query } = require('../config/database');

/**
 * @route   GET /api/garages
 * @desc    Lister les garages certifiés avec filtres (commune, spécialité, 24/7)
 * @access  Public
 */
const getAllGarages = async (req, res, next) => {
  try {
    const { commune, specialty, isOpen24h, search } = req.query;

    let sql = 'SELECT * FROM garages WHERE 1=1';
    const params = [];

    if (commune && commune !== 'all') {
      sql += ' AND LOWER(commune) = LOWER(?)';
      params.push(commune);
    }

    if (isOpen24h === 'true' || isOpen24h === '1') {
      sql += ' AND is_open_24h = 1';
    }

    if (specialty && specialty !== 'all') {
      sql += ' AND JSON_CONTAINS(specialties, ?)';
      params.push(JSON.stringify(specialty));
    }

    if (search && search.trim() !== '') {
      sql += ' AND (nom LIKE ? OR adresse LIKE ? OR commune LIKE ?)';
      const kw = `%${search.trim()}%`;
      params.push(kw, kw, kw);
    }

    sql += ' ORDER BY rating DESC, is_open_24h DESC';

    const garages = await query(sql, params);

    // Formater le champ JSON specialties et harmoniser les champs
    const formatted = garages.map(g => ({
      ...g,
      name: g.nom || g.name,
      address: g.adresse || g.address,
      phone: g.telephone || g.phone,
      opening_hours: g.horaires || g.opening_hours,
      specialties: typeof g.specialties === 'string' ? JSON.parse(g.specialties || '[]') : (g.specialties || [])
    }));

    res.json({
      success: true,
      count: formatted.length,
      garages: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/garages/:id
 * @desc    Obtenir la fiche détaillée d'un garage
 * @access  Public
 */
const getGarageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rows = await query('SELECT * FROM garages WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const g = rows[0];
    const formatted = {
      ...g,
      name: g.nom || g.name,
      address: g.adresse || g.address,
      phone: g.telephone || g.phone,
      opening_hours: g.horaires || g.opening_hours,
      specialties: typeof g.specialties === 'string' ? JSON.parse(g.specialties || '[]') : (g.specialties || [])
    };

    res.json({
      success: true,
      garage: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/garages
 * @desc    Enregistrer un nouveau garage professionnel
 * @access  Privé (Admin ou Garage)
 */
const createGarage = async (req, res, next) => {
  try {
    const {
      name,
      nom,
      commune,
      address,
      adresse,
      phone,
      telephone,
      whatsapp,
      email,
      horaires = 'Lun - Sam : 08h00 - 18h00',
      specialties = [],
      is_open_24h = false,
      photo_url = 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80'
    } = req.body;

    const garageName = nom || name;
    const garagePhone = telephone || phone;
    const garageAddress = adresse || address;

    if (!garageName || !commune || !garagePhone) {
      return res.status(400).json({
        success: false,
        message: 'Nom du garage, commune et numéro de téléphone sont requis.'
      });
    }

    const result = await query(`
      INSERT INTO garages 
        (user_id, nom, commune, adresse, telephone, whatsapp, email, horaires, specialties, is_open_24h, rating, total_reviews, photo_url, verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 1, ?, 1, NOW(), NOW())
    `, [
      req.user ? req.user.id : null,
      garageName.trim(),
      commune.trim(),
      garageAddress || '',
      garagePhone.trim(),
      whatsapp || garagePhone.trim(),
      email || null,
      horaires,
      JSON.stringify(Array.isArray(specialties) ? specialties : [specialties]),
      is_open_24h ? 1 : 0,
      photo_url
    ]);

    res.status(201).json({
      success: true,
      message: 'Garage enregistré avec succès.',
      garageId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/garages/sos-breakdown
 * @desc    Déclencher une demande d'assistance / SOS Dépannage
 * @access  Public
 */
const createBreakdownRequest = async (req, res, next) => {
  try {
    const {
      garage_id,
      client_name,
      client_phone,
      commune,
      car_model = 'Non précisé',
      issue_description,
      emergency_level = 'urgent'
    } = req.body;

    if (!client_name || !client_phone || !commune || !issue_description) {
      return res.status(400).json({
        success: false,
        message: 'Nom, téléphone, commune et description de la panne sont requis.'
      });
    }

    const result = await query(`
      INSERT INTO breakdown_requests 
        (user_id, garage_id, client_name, client_phone, commune, car_model, issue_description, status, emergency_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente', ?, NOW(), NOW())
    `, [
      req.user ? req.user.id : null,
      garage_id || null,
      client_name.trim(),
      client_phone.trim(),
      commune.trim(),
      car_model.trim(),
      issue_description.trim(),
      emergency_level
    ]);

    res.status(201).json({
      success: true,
      message: 'Demande de dépannage transmise avec succès aux équipes d\'intervention.',
      requestId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/garages/sos-breakdown/list
 * @desc    Consulter les demandes de dépannage (pour garagistes ou administrateurs)
 * @access  Privé
 */
const getBreakdownRequests = async (req, res, next) => {
  try {
    const requests = await query(`
      SELECT b.*, g.nom as garage_nom, g.telephone as garage_phone 
      FROM breakdown_requests b
      LEFT JOIN garages g ON b.garage_id = g.id
      ORDER BY b.created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/garages/sos-breakdown/:id/status
 * @desc    Mettre à jour le statut d'une intervention
 * @access  Privé
 */
const updateBreakdownStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['en_attente', 'pris_en_charge', 'termine', 'annule'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide.' });
    }

    await query('UPDATE breakdown_requests SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: `Statut de l'intervention mis à jour : ${status}`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGarages,
  getGarageById,
  createGarage,
  createBreakdownRequest,
  getBreakdownRequests,
  updateBreakdownStatus
};
