const { query } = require('../config/database');

/**
 * @route   GET /api/vehicles
 * @desc    Obtenir tous les véhicules avec filtres avancés (recherche, marque, prix, carburant, etc.)
 * @access  Public
 */
const getVehicles = async (req, res, next) => {
  try {
    const {
      search,
      dealership_id,
      marque,
      modele,
      categorie,
      carburant,
      transmission,
      etat,
      status,
      prix_min,
      prix_max,
      annee_min,
      annee_max,
      km_max,
      en_promo,
      en_vedette,
      sort_by = 'recent',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = ['1=1'];
    let params = [];

    if (search) {
      whereClauses.push('(v.marque LIKE ? OR v.modele LIKE ? OR v.finition LIKE ? OR v.description LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (dealership_id) {
      whereClauses.push('v.dealership_id = ?');
      params.push(dealership_id);
    }

    if (marque) {
      whereClauses.push('v.marque = ?');
      params.push(marque);
    }

    if (modele) {
      whereClauses.push('v.modele LIKE ?');
      params.push(`%${modele}%`);
    }

    if (categorie) {
      whereClauses.push('v.categorie = ?');
      params.push(categorie);
    }

    if (carburant) {
      whereClauses.push('v.carburant = ?');
      params.push(carburant);
    }

    if (transmission) {
      whereClauses.push('v.transmission = ?');
      params.push(transmission);
    }

    if (etat) {
      whereClauses.push('v.etat = ?');
      params.push(etat);
    }

    if (status) {
      whereClauses.push('v.status = ?');
      params.push(status);
    }

    if (prix_min) {
      whereClauses.push('v.prix >= ?');
      params.push(parseFloat(prix_min));
    }

    if (prix_max) {
      whereClauses.push('v.prix <= ?');
      params.push(parseFloat(prix_max));
    }

    if (annee_min) {
      whereClauses.push('v.annee >= ?');
      params.push(parseInt(annee_min));
    }

    if (annee_max) {
      whereClauses.push('v.annee <= ?');
      params.push(parseInt(annee_max));
    }

    if (km_max) {
      whereClauses.push('v.kilometrage <= ?');
      params.push(parseInt(km_max));
    }

    if (en_promo === 'true' || en_promo === '1') {
      whereClauses.push('v.en_promo = 1');
    }

    if (en_vedette === 'true' || en_vedette === '1') {
      whereClauses.push('v.en_vedette = 1');
    }

    // Gestion du tri
    let orderBySql = 'v.created_at DESC';
    switch (sort_by) {
      case 'prix-asc':
        orderBySql = 'v.prix ASC';
        break;
      case 'prix-desc':
        orderBySql = 'v.prix DESC';
        break;
      case 'km-asc':
        orderBySql = 'v.kilometrage ASC';
        break;
      case 'annee-desc':
        orderBySql = 'v.annee DESC';
        break;
      case 'recent':
      default:
        orderBySql = 'v.created_at DESC';
        break;
    }

    const whereSql = whereClauses.join(' AND ');

    // Récupération des véhicules avec la photo principale et le nom du concessionnaire
    const vehicles = await query(
      `SELECT v.*, 
              d.nom AS dealership_nom,
              d.ville AS dealership_ville,
              d.telephone AS dealership_telephone,
              d.logo_url AS dealership_logo,
              (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = v.id ORDER BY vi.is_primary DESC, vi.display_order ASC LIMIT 1) AS primary_image
       FROM vehicles v
       JOIN dealerships d ON v.dealership_id = d.id
       WHERE ${whereSql}
       ORDER BY ${orderBySql}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Formater les équipements JSON et parser si besoin
    const formattedVehicles = vehicles.map(veh => {
      let eq = veh.equipements;
      if (typeof eq === 'string') {
        try {
          eq = JSON.parse(eq);
        } catch {
          eq = [];
        }
      }
      return {
        ...veh,
        equipements: eq || []
      };
    });

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM vehicles v WHERE ${whereSql}`,
      params
    );

    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      count: formattedVehicles.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: formattedVehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/vehicles/:id
 * @desc    Obtenir le détail d'un véhicule avec sa galerie d'images et sa concession
 * @access  Public
 */
const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vehicles = await query(
      `SELECT v.*, 
              d.nom AS dealership_nom,
              d.slogan AS dealership_slogan,
              d.adresse AS dealership_adresse,
              d.ville AS dealership_ville,
              d.telephone AS dealership_telephone,
              d.email AS dealership_email,
              d.horaires AS dealership_horaires,
              d.site_web AS dealership_site_web,
              d.logo_url AS dealership_logo
       FROM vehicles v
       JOIN dealerships d ON v.dealership_id = d.id
       WHERE v.id = ? LIMIT 1`,
      [id]
    );

    if (vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule introuvable.'
      });
    }

    const vehicle = vehicles[0];

    // Incrémenter le compteur de vues
    await query('UPDATE vehicles SET views_count = views_count + 1 WHERE id = ?', [id]);

    // Récupérer toutes les images du véhicule
    const images = await query(
      'SELECT id, image_url, is_primary, display_order FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_primary DESC, display_order ASC',
      [id]
    );

    let equipements = vehicle.equipements;
    if (typeof equipements === 'string') {
      try {
        equipements = JSON.parse(equipements);
      } catch {
        equipements = [];
      }
    }

    res.json({
      success: true,
      data: {
        ...vehicle,
        equipements: equipements || [],
        images: images.map(img => img.image_url),
        image_records: images
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/vehicles
 * @desc    Ajouter un véhicule en stock
 * @access  Private (Dealer, Admin)
 */
const createVehicle = async (req, res, next) => {
  try {
    const {
      dealership_id,
      marque,
      modele,
      finition = '',
      annee,
      prix,
      msrp,
      remise_instantanee = 0,
      ancien_prix,
      en_promo = false,
      kilometrage = 0,
      carburant = 'Essence',
      transmission = 'Automatique',
      categorie = 'Berline',
      etat = 'occasion',
      status = 'disponible',
      puissance_ch = 0,
      puissance_fiscale = 0,
      couleur = 'Noir',
      couleur_interieure,
      moteur,
      motrice = 'Traction',
      portes = 5,
      places = 5,
      co2_gkm = 0,
      garantie_mois = 12,
      vin,
      description,
      equipements = [],
      en_vedette = false,
      images = []
    } = req.body;

    if (!dealership_id || !marque || !modele || !annee || !prix) {
      return res.status(400).json({
        success: false,
        message: 'Champs obligatoires manquants : concession, marque, modèle, année, prix.'
      });
    }

    // Vérifier l'accès à la concession
    if (req.user.role !== 'admin') {
      const dealCheck = await query('SELECT user_id FROM dealerships WHERE id = ?', [dealership_id]);
      if (dealCheck.length === 0 || dealCheck[0].user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez ajouter des véhicules que pour votre concession.'
        });
      }
    }

    const equipementsJson = JSON.stringify(Array.isArray(equipements) ? equipements : []);

    const result = await query(
      `INSERT INTO vehicles (
        dealership_id, user_id, marque, modele, finition, annee, prix, msrp,
        remise_instantanee, ancien_prix, en_promo, kilometrage, carburant,
        transmission, categorie, etat, status, puissance_ch, puissance_fiscale,
        couleur, couleur_interieure, moteur, motrice, portes, places, co2_gkm,
        garantie_mois, vin, description, equipements, en_vedette, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )`,
      [
        dealership_id,
        req.user.id,
        marque.trim(),
        modele.trim(),
        finition,
        parseInt(annee),
        parseFloat(prix),
        msrp ? parseFloat(msrp) : null,
        parseFloat(remise_instantanee || 0),
        ancien_prix ? parseFloat(ancien_prix) : null,
        en_promo ? 1 : 0,
        parseInt(kilometrage || 0),
        carburant,
        transmission,
        categorie,
        etat,
        status,
        parseInt(puissance_ch || 0),
        parseInt(puissance_fiscale || 0),
        couleur,
        couleur_interieure,
        moteur,
        motrice,
        parseInt(portes || 5),
        parseInt(places || 5),
        parseInt(co2_gkm || 0),
        parseInt(garantie_mois || 12),
        vin,
        description,
        equipementsJson,
        en_vedette ? 1 : 0
      ]
    );

    const vehicleId = result.insertId;

    // Ajouter les photos si fournies
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query(
          'INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
          [vehicleId, images[i], i === 0 ? 1 : 0, i]
        );
      }
    }

    const newVehicle = await query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

    res.status(201).json({
      success: true,
      message: 'Véhicule ajouté au catalogue avec succès.',
      data: newVehicle[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Modifier les détails d'un véhicule
 * @access  Private (Dealer propriétaire ou Admin)
 */
const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query(
      `SELECT v.*, d.user_id as dealership_owner 
       FROM vehicles v 
       JOIN dealerships d ON v.dealership_id = d.id 
       WHERE v.id = ? LIMIT 1`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    if (req.user.role !== 'admin' && existing[0].dealership_owner !== req.user.id && existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Non autorisé à modifier ce véhicule.' });
    }

    const allowedFields = [
      'marque', 'modele', 'finition', 'annee', 'prix', 'msrp', 'remise_instantanee',
      'ancien_prix', 'en_promo', 'kilometrage', 'carburant', 'transmission',
      'categorie', 'etat', 'status', 'puissance_ch', 'puissance_fiscale',
      'couleur', 'couleur_interieure', 'moteur', 'motrice', 'portes', 'places',
      'co2_gkm', 'garantie_mois', 'vin', 'description', 'en_vedette'
    ];

    let updateClauses = [];
    let params = [];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateClauses.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    });

    if (req.body.equipements !== undefined) {
      updateClauses.push('equipements = ?');
      params.push(JSON.stringify(Array.isArray(req.body.equipements) ? req.body.equipements : []));
    }

    if (updateClauses.length > 0) {
      updateClauses.push('updated_at = NOW()');
      params.push(id);
      await query(`UPDATE vehicles SET ${updateClauses.join(', ')} WHERE id = ?`, params);
    }

    // Mise à jour éventuelle des images
    if (Array.isArray(req.body.images)) {
      await query('DELETE FROM vehicle_images WHERE vehicle_id = ?', [id]);
      for (let i = 0; i < req.body.images.length; i++) {
        await query(
          'INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
          [id, req.body.images[i], i === 0 ? 1 : 0, i]
        );
      }
    }

    const updated = await query('SELECT * FROM vehicles WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Véhicule mis à jour avec succès.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Supprimer un véhicule
 * @access  Private (Dealer propriétaire ou Admin)
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query(
      `SELECT v.*, d.user_id as dealership_owner 
       FROM vehicles v 
       JOIN dealerships d ON v.dealership_id = d.id 
       WHERE v.id = ? LIMIT 1`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    if (req.user.role !== 'admin' && existing[0].dealership_owner !== req.user.id && existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Non autorisé à supprimer ce véhicule.' });
    }

    await query('DELETE FROM vehicles WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Véhicule retiré du stock avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
