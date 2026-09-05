const { query } = require('../config/database');

/**
 * @route   GET /api/dealerships
 * @desc    Obtenir la liste des concessions automobiles avec filtres
 * @access  Public
 */
const getDealerships = async (req, res, next) => {
  try {
    const { search, ville, plan_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = ['1=1'];
    let params = [];

    if (search) {
      whereClauses.push('(d.nom LIKE ? OR d.slogan LIKE ? OR d.adresse LIKE ?)');
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (ville) {
      whereClauses.push('d.ville = ?');
      params.push(ville);
    }

    if (plan_id) {
      whereClauses.push('d.plan_id = ?');
      params.push(plan_id);
    }

    const whereSql = whereClauses.join(' AND ');

    // Récupérer les concessions avec le nombre de véhicules disponibles
    const dealerships = await query(
      `SELECT d.*, 
              COUNT(v.id) AS total_vehicles,
              SUM(CASE WHEN v.status = 'disponible' THEN 1 ELSE 0 END) AS available_vehicles
       FROM dealerships d
       LEFT JOIN vehicles v ON d.id = v.dealership_id
       WHERE ${whereSql}
       GROUP BY d.id
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM dealerships d WHERE ${whereSql}`,
      params
    );

    res.json({
      success: true,
      count: dealerships.length,
      total: countResult[0]?.total || 0,
      page: parseInt(page),
      totalPages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit)),
      data: dealerships
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dealerships/:id
 * @desc    Obtenir le détail d'une concession automobile avec ses véhicules
 * @access  Public
 */
const getDealershipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dealerships = await query(
      `SELECT d.*, u.name as owner_name, u.email as owner_email
       FROM dealerships d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = ? LIMIT 1`,
      [id]
    );

    if (dealerships.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Concession automobile introuvable.'
      });
    }

    const dealership = dealerships[0];

    // Véhicules en stock
    const vehicles = await query(
      `SELECT v.*, 
              (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = v.id AND vi.is_primary = 1 LIMIT 1) AS primary_image
       FROM vehicles v
       WHERE v.dealership_id = ?
       ORDER BY v.en_vedette DESC, v.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...dealership,
        vehicles
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/dealerships
 * @desc    Créer une nouvelle concession automobile
 * @access  Private (Dealer, Admin)
 */
const createDealership = async (req, res, next) => {
  try {
    const {
      nom,
      slogan,
      adresse,
      ville = 'Kinshasa',
      code_postal,
      telephone,
      email,
      horaires,
      site_web,
      logo_url,
      banner_url,
      siret,
      plan_id = 'starter'
    } = req.body;

    if (!nom) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la concession est obligatoire.'
      });
    }

    const result = await query(
      `INSERT INTO dealerships 
        (user_id, nom, slogan, adresse, ville, code_postal, telephone, email, horaires, site_web, logo_url, banner_url, siret, plan_id, statut_abonnement, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'essai_gratuit', NOW(), NOW())`,
      [
        req.user.id,
        nom.trim(),
        slogan,
        adresse,
        ville,
        code_postal,
        telephone,
        email,
        horaires,
        site_web,
        logo_url,
        banner_url,
        siret,
        plan_id
      ]
    );

    const newDealership = await query('SELECT * FROM dealerships WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Concession automobile enregistrée avec succès.',
      data: newDealership[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/dealerships/:id
 * @desc    Mettre à jour les informations d'une concession
 * @access  Private (Dealer propriétaire ou Admin)
 */
const updateDealership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && existing[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette concession automobile.'
      });
    }

    const fields = [
      'nom', 'slogan', 'adresse', 'ville', 'code_postal', 'telephone',
      'email', 'horaires', 'site_web', 'logo_url', 'banner_url', 'siret', 'plan_id'
    ];

    let updateClauses = [];
    let params = [];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updateClauses.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    });

    if (updateClauses.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun champ à modifier fourni.' });
    }

    updateClauses.push('updated_at = NOW()');
    params.push(id);

    await query(`UPDATE dealerships SET ${updateClauses.join(', ')} WHERE id = ?`, params);

    const updated = await query('SELECT * FROM dealerships WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Concession mise à jour avec succès.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/dealerships/:id
 * @desc    Supprimer une concession automobile
 * @access  Private (Admin uniquement)
 */
const deleteDealership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    await query('DELETE FROM dealerships WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Concession automobile et son catalogue supprimés avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDealerships,
  getDealershipById,
  createDealership,
  updateDealership,
  deleteDealership
};
