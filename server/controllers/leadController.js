const { query } = require('../config/database');

/**
 * @route   POST /api/leads
 * @desc    Créer une demande client (Essai routier, Offre de reprise, Devis, Financement)
 * @access  Public (ou Authentifié)
 */
const createLead = async (req, res, next) => {
  try {
    const {
      dealership_id,
      vehicle_id,
      vehicle_title,
      vehicle_price = 0,
      nom_client,
      email,
      telephone,
      type_demande = 'information',
      date_souhaitee,
      horaire_souhaite,
      message,
      offre_prix_proposee,
      vehicule_reprise_info
    } = req.body;

    if (!nom_client || !email || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Nom, e-mail et numéro de téléphone sont requis.'
      });
    }

    // Récupérer le concessionnaire associé au véhicule si non spécifié
    let targetDealershipId = dealership_id;
    let targetVehicleTitle = vehicle_title;
    let targetVehiclePrice = vehicle_price;

    if (vehicle_id && (!targetDealershipId || !targetVehicleTitle)) {
      const v = await query('SELECT dealership_id, marque, modele, annee, prix FROM vehicles WHERE id = ? LIMIT 1', [vehicle_id]);
      if (v.length > 0) {
        if (!targetDealershipId) targetDealershipId = v[0].dealership_id;
        if (!targetVehicleTitle) targetVehicleTitle = `${v[0].marque} ${v[0].modele} ${v[0].annee}`;
        if (!targetVehiclePrice) targetVehiclePrice = v[0].prix;
      }
    }

    const userId = req.user ? req.user.id : null;

    const result = await query(
      `INSERT INTO leads (
        dealership_id, vehicle_id, user_id, vehicle_title, vehicle_price,
        nom_client, email, telephone, type_demande, date_souhaitee,
        horaire_souhaite, message, offre_prix_proposee, vehicule_reprise_info,
        statut, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'nouveau', NOW(), NOW())`,
      [
        targetDealershipId,
        vehicle_id || null,
        userId,
        targetVehicleTitle || 'Véhicule en concession',
        targetVehiclePrice || 0,
        nom_client.trim(),
        email.toLowerCase().trim(),
        telephone.trim(),
        type_demande,
        date_souhaitee || null,
        horaire_souhaite || null,
        message || null,
        offre_prix_proposee ? parseFloat(offre_prix_proposee) : null,
        vehicule_reprise_info || null
      ]
    );

    const newLead = await query('SELECT * FROM leads WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Votre demande a été transmise au concessionnaire avec succès.',
      data: newLead[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/leads
 * @desc    Obtenir la liste des leads (pour le concessionnaire connecté ou l'admin)
 * @access  Private (Dealer, Salesperson, Admin)
 */
const getLeads = async (req, res, next) => {
  try {
    const { dealership_id, statut, type_demande, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = ['1=1'];
    let params = [];

    // Si concessionnaire, restreindre à sa propre concession
    if (req.user.role === 'dealer' || req.user.role === 'salesperson') {
      const userDeals = await query('SELECT id FROM dealerships WHERE user_id = ?', [req.user.id]);
      const dealId = userDeals.length > 0 ? userDeals[0].id : null;
      if (!dealId) {
        return res.json({ success: true, count: 0, total: 0, data: [] });
      }
      whereClauses.push('l.dealership_id = ?');
      params.push(dealId);
    } else if (dealership_id && req.user.role === 'admin') {
      whereClauses.push('l.dealership_id = ?');
      params.push(dealership_id);
    }

    if (statut) {
      whereClauses.push('l.statut = ?');
      params.push(statut);
    }

    if (type_demande) {
      whereClauses.push('l.type_demande = ?');
      params.push(type_demande);
    }

    const whereSql = whereClauses.join(' AND ');

    const leads = await query(
      `SELECT l.*, d.nom as dealership_nom, v.marque, v.modele, v.annee,
              (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = l.vehicle_id ORDER BY vi.is_primary DESC LIMIT 1) AS vehicle_image
       FROM leads l
       LEFT JOIN dealerships d ON l.dealership_id = d.id
       LEFT JOIN vehicles v ON l.vehicle_id = v.id
       WHERE ${whereSql}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM leads l WHERE ${whereSql}`,
      params
    );

    res.json({
      success: true,
      count: leads.length,
      total: countResult[0]?.total || 0,
      page: parseInt(page),
      data: leads
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/leads/:id/status
 * @desc    Mettre à jour le statut d'un lead (rdv_fixe, contacte, conclu, etc.)
 * @access  Private (Dealer, Admin)
 */
const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut, notes_admin } = req.body;

    const allowedStatus = ['nouveau', 'contacte', 'rdv_fixe', 'conclu', 'annule'];
    if (statut && !allowedStatus.includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut de demande invalide.' });
    }

    await query(
      'UPDATE leads SET statut = COALESCE(?, statut), notes_admin = COALESCE(?, notes_admin), updated_at = NOW() WHERE id = ?',
      [statut, notes_admin, id]
    );

    const updated = await query('SELECT * FROM leads WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Statut du lead mis à jour avec succès.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLeads,
  updateLeadStatus
};
