const { query } = require('../config/database');

/**
 * Statuts officiels de l'annonce d'un véhicule CONGOCAR
 */
const VALID_STATUSES = ['pending', 'approved', 'rejected', 'sold', 'inactive'];

/**
 * Helper de normalisation du statut
 */
const normalizeStatus = (status, defaultStatus = 'pending') => {
  if (!status) return defaultStatus;
  const s = String(status).toLowerCase().trim();
  // Alias de rétrocompatibilité
  if (s === 'disponible') return 'approved';
  if (s === 'vendu') return 'sold';
  if (s === 'archive') return 'inactive';
  if (VALID_STATUSES.includes(s)) return s;
  return defaultStatus;
};

/**
 * @route   GET /api/vehicles
 * @desc    Obtenir les véhicules avec recherche, filtres avancés, tri, pagination et statut
 * @access  Public (avec détection de l'utilisateur connecté pour les favoris)
 */
const getVehicles = async (req, res, next) => {
  try {
    const {
      search,
      q,
      dealership_id,
      dealer_id,
      marque,
      modele,
      categorie,
      carburant,
      transmission,
      etat,
      status,
      all_statuses,
      prix_min,
      prix_max,
      annee_min,
      annee_max,
      km_min,
      km_max,
      ville,
      en_promo,
      en_vedette,
      sort,
      sort_by = 'recent',
      page = 1,
      limit = 12
    } = req.query;

    const querySearch = search || q;
    const querySort = sort || sort_by;
    const queryDealerId = dealership_id || dealer_id;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 12, 1), 100);
    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    let whereClauses = ['1=1'];
    let params = [];

    // 1. RECHERCHE TEXTUELLE (marque, modele, finition, description, vin, ville, categorie)
    if (querySearch && querySearch.trim()) {
      whereClauses.push(
        '(v.marque LIKE ? OR v.modele LIKE ? OR v.finition LIKE ? OR v.description LIKE ? OR v.ville LIKE ? OR v.categorie LIKE ? OR v.vin LIKE ?)'
      );
      const s = `%${querySearch.trim()}%`;
      params.push(s, s, s, s, s, s, s);
    }

    // 2. GESTION DU STATUT DE L'ANNONCE (pending, approved, rejected, sold, inactive)
    if (status) {
      if (status !== 'all') {
        const normStatus = normalizeStatus(status, 'approved');
        whereClauses.push('v.status = ?');
        params.push(normStatus);
      }
    } else {
      // Par défaut pour le public : afficher uniquement les annonces approuvées (approved)
      // Sauf si un administrateur demande all_statuses=true
      if (req.user?.role === 'admin' && (all_statuses === 'true' || all_statuses === '1')) {
        // Pas de filtre sur le statut pour l'admin
      } else {
        whereClauses.push('v.status = ?');
        params.push('approved');
      }
    }

    // 3. FILTRES DÉTAILLÉS
    if (queryDealerId) {
      whereClauses.push('v.dealership_id = ?');
      params.push(queryDealerId);
    }

    if (marque) {
      whereClauses.push('v.marque LIKE ?');
      params.push(`%${marque.trim()}%`);
    }

    if (modele) {
      whereClauses.push('v.modele LIKE ?');
      params.push(`%${modele.trim()}%`);
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

    if (km_min) {
      whereClauses.push('v.kilometrage >= ?');
      params.push(parseInt(km_min));
    }

    if (km_max) {
      whereClauses.push('v.kilometrage <= ?');
      params.push(parseInt(km_max));
    }

    if (ville) {
      whereClauses.push('(v.ville LIKE ? OR d.ville LIKE ?)');
      params.push(`%${ville.trim()}%`, `%${ville.trim()}%`);
    }

    if (en_promo === 'true' || en_promo === '1') {
      whereClauses.push('v.en_promo = 1');
    }

    if (en_vedette === 'true' || en_vedette === '1') {
      whereClauses.push('v.en_vedette = 1');
    }

    // 4. GESTION DU TRI
    let orderBySql = 'v.created_at DESC';
    switch (querySort) {
      case 'prix-asc':
        orderBySql = 'v.prix ASC';
        break;
      case 'prix-desc':
        orderBySql = 'v.prix DESC';
        break;
      case 'annee-desc':
        orderBySql = 'v.annee DESC';
        break;
      case 'annee-asc':
        orderBySql = 'v.annee ASC';
        break;
      case 'km-asc':
        orderBySql = 'v.kilometrage ASC';
        break;
      case 'km-desc':
        orderBySql = 'v.kilometrage DESC';
        break;
      case 'popular':
      case 'vues-desc':
        orderBySql = 'v.views_count DESC';
        break;
      case 'alphabetique':
      case 'name-asc':
        orderBySql = 'v.marque ASC, v.modele ASC';
        break;
      case 'recent':
      case 'date-desc':
      default:
        orderBySql = 'v.created_at DESC';
        break;
    }

    const whereSql = whereClauses.join(' AND ');

    // 5. REQUÊTE PRINCIPALE AVEC CONCESSIONNAIRE & IMAGE PRINCIPALE
    const rawVehicles = await query(
      `SELECT v.*, 
              d.nom AS dealership_nom,
              d.ville AS dealership_ville,
              d.telephone AS dealership_telephone,
              d.logo_url AS dealership_logo,
              (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = v.id ORDER BY vi.is_primary DESC, vi.display_order ASC LIMIT 1) AS primary_image
       FROM vehicles v
       LEFT JOIN dealerships d ON v.dealership_id = d.id
       WHERE ${whereSql}
       ORDER BY ${orderBySql}
       LIMIT ? OFFSET ?`,
      [...params, parsedLimit, offset]
    );

    // 6. TOTAL DES RÉSULTATS POUR LA PAGINATION
    const countResult = await query(
      `SELECT COUNT(*) AS total FROM vehicles v LEFT JOIN dealerships d ON v.dealership_id = d.id WHERE ${whereSql}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // 7. DÉTECTION DES VÉHICULES FAVORIS POUR L'UTILISATEUR CONNECTÉ
    let userFavoriteIds = new Set();
    if (req.user?.id) {
      try {
        const userFavs = await query(
          'SELECT vehicle_id FROM vehicle_favorites WHERE user_id = ?',
          [req.user.id]
        );
        userFavoriteIds = new Set(userFavs.map(f => Number(f.vehicle_id)));
      } catch {
        // Table fallback silencieux
      }
    }

    // 8. FORMATAGE DES VÉHICULES
    const formattedVehicles = rawVehicles.map(veh => {
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
        status: normalizeStatus(veh.status, 'approved'),
        equipements: Array.isArray(eq) ? eq : [],
        is_favorite: userFavoriteIds.has(Number(veh.id))
      };
    });

    const totalPages = Math.ceil(total / parsedLimit) || 1;

    res.json({
      success: true,
      count: formattedVehicles.length,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      hasPrevPage: parsedPage > 1,
      hasNextPage: parsedPage < totalPages,
      data: formattedVehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/vehicles/:id
 * @desc    Obtenir le détail complet d'un véhicule avec sa galerie photos et concessionnaire
 * @access  Public (avec détection utilisateur connecté)
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
              d.logo_url AS dealership_logo,
              d.user_id AS dealership_owner
       FROM vehicles v
       LEFT JOIN dealerships d ON v.dealership_id = d.id
       WHERE v.id = ? LIMIT 1`,
      [id]
    );

    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule introuvable.'
      });
    }

    const vehicle = vehicles[0];

    // Incrémenter le compteur de vues
    await query('UPDATE vehicles SET views_count = views_count + 1 WHERE id = ?', [id]);

    // Récupérer toutes les images de la galerie
    const images = await query(
      'SELECT id, image_url, is_primary, display_order FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_primary DESC, display_order ASC',
      [id]
    );

    // Vérifier si le véhicule est en favori
    let isFavorite = false;
    if (req.user?.id) {
      const favCheck = await query(
        'SELECT id FROM vehicle_favorites WHERE user_id = ? AND vehicle_id = ? LIMIT 1',
        [req.user.id, id]
      );
      isFavorite = favCheck && favCheck.length > 0;
    }

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
        status: normalizeStatus(vehicle.status, 'approved'),
        equipements: Array.isArray(equipements) ? equipements : [],
        is_favorite: isFavorite,
        images: images.map(img => img.image_url),
        image_records: images
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/vehicles/:id/similar
 * @desc    Obtenir les véhicules similaires (même catégorie, même marque, ou prix proche)
 * @access  Public
 */
const getSimilarVehicles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 4, 12);

    // Récupérer le véhicule de référence
    const target = await query('SELECT id, marque, categorie, prix FROM vehicles WHERE id = ? LIMIT 1', [id]);
    if (!target || target.length === 0) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    const baseVeh = target[0];
    const minPrice = (parseFloat(baseVeh.prix) || 0) * 0.65;
    const maxPrice = (parseFloat(baseVeh.prix) || 0) * 1.35;

    // Recherche de véhicules similaires approuvés, excluant le véhicule actuel
    const similarVehicles = await query(
      `SELECT v.*, 
              d.nom AS dealership_nom,
              d.ville AS dealership_ville,
              (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = v.id ORDER BY vi.is_primary DESC, vi.display_order ASC LIMIT 1) AS primary_image
       FROM vehicles v
       LEFT JOIN dealerships d ON v.dealership_id = d.id
       WHERE v.id != ? 
         AND v.status = 'approved'
         AND (v.categorie = ? OR v.marque = ? OR (v.prix BETWEEN ? AND ?))
       ORDER BY 
         (CASE WHEN v.categorie = ? AND v.marque = ? THEN 3
               WHEN v.categorie = ? THEN 2
               WHEN v.marque = ? THEN 1
               ELSE 0 END) DESC,
         v.created_at DESC
       LIMIT ?`,
      [id, baseVeh.categorie, baseVeh.marque, minPrice, maxPrice, baseVeh.categorie, baseVeh.marque, baseVeh.categorie, baseVeh.marque, limit]
    );

    // Détection des favoris si connecté
    let userFavoriteIds = new Set();
    if (req.user?.id) {
      const userFavs = await query('SELECT vehicle_id FROM vehicle_favorites WHERE user_id = ?', [req.user.id]);
      userFavoriteIds = new Set(userFavs.map(f => Number(f.vehicle_id)));
    }

    const formatted = similarVehicles.map(veh => ({
      ...veh,
      status: normalizeStatus(veh.status, 'approved'),
      is_favorite: userFavoriteIds.has(Number(veh.id))
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/vehicles
 * @desc    Créer une nouvelle annonce de véhicule
 * @access  Privé (Dealer, Seller, Admin, User)
 */
const createVehicle = async (req, res, next) => {
  try {
    const {
      dealership_id = 1,
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
      categorie = 'SUV',
      etat = 'occasion',
      status: requestedStatus,
      puissance_ch = 0,
      puissance_fiscale = 0,
      couleur = 'Noir',
      couleur_interieure,
      moteur,
      motrice = '4x4',
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

    if (!marque || !modele || !annee || !prix) {
      return res.status(400).json({
        success: false,
        message: 'Champs obligatoires manquants : marque, modèle, année, prix.'
      });
    }

    // Gestion du statut initial :
    // Si l'utilisateur est admin, statut approuvé par défaut ou demandé.
    // Pour les autres utilisateurs, statut "pending" (en attente de modération) par défaut.
    let initialStatus = 'pending';
    if (req.user?.role === 'admin') {
      initialStatus = requestedStatus ? normalizeStatus(requestedStatus, 'approved') : 'approved';
    } else if (requestedStatus && VALID_STATUSES.includes(requestedStatus)) {
      // Les vendeurs peuvent soumettre en "pending" ou "inactive"
      initialStatus = ['pending', 'inactive'].includes(requestedStatus) ? requestedStatus : 'pending';
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
        parseInt(dealership_id) || 1,
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
        initialStatus,
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

    // Enregistrer les images si fournies
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query(
          'INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
          [vehicleId, images[i], i === 0 ? 1 : 0, i]
        );
      }
    }

    const created = await query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

    res.status(201).json({
      success: true,
      message: initialStatus === 'approved' 
        ? 'Véhicule publié avec succès.' 
        : 'Annonce créée et transmise pour modération (statut : pending).',
      data: created[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Modifier un véhicule existant
 * @access  Privé (Propriétaire de l'annonce ou Admin)
 */
const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query(
      `SELECT v.*, d.user_id as dealership_owner 
       FROM vehicles v 
       LEFT JOIN dealerships d ON v.dealership_id = d.id 
       WHERE v.id = ? LIMIT 1`,
      [id]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    const targetVehicle = existing[0];

    // Vérification des droits : Admin ou Propriétaire
    const isOwner = targetVehicle.user_id === req.user.id || targetVehicle.dealership_owner === req.user.id;
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Non autorisé à modifier ce véhicule.' });
    }

    // Validation du statut si modifié
    if (req.body.status) {
      const newStatus = normalizeStatus(req.body.status, null);
      if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
        return res.status(400).json({
          success: false,
          message: `Statut invalide. Statuts acceptés : ${VALID_STATUSES.join(', ')}.`
        });
      }
      // Seul l'admin peut directement passer une annonce en 'approved' ou 'rejected'
      if (['approved', 'rejected'].includes(newStatus) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Seul un administrateur peut approuver ou rejeter une annonce.'
        });
      }
    }

    const allowedFields = [
      'marque', 'modele', 'finition', 'annee', 'prix', 'msrp', 'remise_instantanee',
      'ancien_prix', 'en_promo', 'kilometrage', 'carburant', 'transmission',
      'categorie', 'etat', 'status', 'puissance_ch', 'puissance_fiscale',
      'couleur', 'couleur_interieure', 'moteur', 'motrice', 'portes', 'places',
      'co2_gkm', 'garantie_mois', 'vin', 'description', 'en_vedette', 'ville'
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

    // Mise à jour de la galerie photos si fournie
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
 * @route   PATCH /api/vehicles/:id/status
 * @desc    Modifier spécifiquement le statut d'une annonce (pending, approved, rejected, sold, inactive)
 * @access  Privé (Admin ou Propriétaire)
 */
const updateVehicleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason = '' } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Le champ status est requis.'
      });
    }

    const normStatus = normalizeStatus(status, null);
    if (!normStatus || !VALID_STATUSES.includes(normStatus)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide [${status}]. Les statuts acceptés sont : ${VALID_STATUSES.join(', ')}.`
      });
    }

    const existing = await query(
      `SELECT v.*, d.user_id as dealership_owner 
       FROM vehicles v 
       LEFT JOIN dealerships d ON v.dealership_id = d.id 
       WHERE v.id = ? LIMIT 1`,
      [id]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    const targetVehicle = existing[0];
    const isOwner = targetVehicle.user_id === req.user.id || targetVehicle.dealership_owner === req.user.id;

    // RBAC sur les statuts
    if (req.user.role !== 'admin') {
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Non autorisé à modifier ce véhicule.' });
      }
      // Un propriétaire peut marquer comme vendu (sold), désactiver (inactive), ou renvoyer en révision (pending)
      if (['approved', 'rejected'].includes(normStatus)) {
        return res.status(403).json({
          success: false,
          message: 'Seul un administrateur peut approuver ou rejeter définitivement une annonce.'
        });
      }
    }

    await query('UPDATE vehicles SET status = ?, updated_at = NOW() WHERE id = ?', [normStatus, id]);

    res.json({
      success: true,
      message: `Statut de l'annonce mis à jour avec succès en [${normStatus}].`,
      data: {
        id: Number(id),
        status: normStatus,
        rejection_reason: normStatus === 'rejected' ? rejection_reason : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Supprimer un véhicule
 * @access  Privé (Propriétaire ou Admin)
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query(
      `SELECT v.*, d.user_id as dealership_owner 
       FROM vehicles v 
       LEFT JOIN dealerships d ON v.dealership_id = d.id 
       WHERE v.id = ? LIMIT 1`,
      [id]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    const isOwner = existing[0].user_id === req.user.id || existing[0].dealership_owner === req.user.id;
    if (req.user.role !== 'admin' && !isOwner) {
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

/**
 * @route   GET /api/vehicles/favorites (ou /api/favorites)
 * @desc    Lister tous les véhicules favoris de l'utilisateur connecté
 * @access  Privé (Tous rôles connectés)
 */
const getUserFavorites = async (req, res, next) => {
  try {
    const favorites = await query(
      `SELECT 
         f.id as favorite_id,
         f.created_at as favorited_at,
         v.*,
         COALESCE(d.nom, '') as dealership_nom,
         COALESCE(d.ville, '') as dealership_ville,
         (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = v.id ORDER BY vi.is_primary DESC, vi.display_order ASC LIMIT 1) as primary_image
       FROM vehicle_favorites f
       JOIN vehicles v ON f.vehicle_id = v.id
       LEFT JOIN dealerships d ON v.dealership_id = d.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    const formatted = favorites.map(veh => ({
      ...veh,
      status: normalizeStatus(veh.status, 'approved'),
      is_favorite: true
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/vehicles/:id/favorite
 * @desc    Ajouter ou basculer un véhicule en favori
 * @access  Privé
 */
const toggleFavoriteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicleId = Number(id);

    // Vérifier l'existence du véhicule
    const veh = await query('SELECT id FROM vehicles WHERE id = ? LIMIT 1', [vehicleId]);
    if (!veh || veh.length === 0) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    // Vérifier si déjà en favori
    const existingFav = await query(
      'SELECT id FROM vehicle_favorites WHERE user_id = ? AND vehicle_id = ? LIMIT 1',
      [req.user.id, vehicleId]
    );

    if (existingFav && existingFav.length > 0) {
      // Retirer du favori
      await query('DELETE FROM vehicle_favorites WHERE user_id = ? AND vehicle_id = ?', [req.user.id, vehicleId]);
      return res.json({
        success: true,
        is_favorite: false,
        message: 'Véhicule retiré de vos favoris.',
        vehicle_id: vehicleId
      });
    } else {
      // Ajouter au favori
      await query(
        'INSERT INTO vehicle_favorites (user_id, vehicle_id, created_at) VALUES (?, ?, NOW())',
        [req.user.id, vehicleId]
      );
      return res.status(201).json({
        success: true,
        is_favorite: true,
        message: 'Véhicule sauvegardé dans vos favoris.',
        vehicle_id: vehicleId
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/vehicles/:id/favorite
 * @desc    Retirer explicitement un véhicule des favoris
 * @access  Privé
 */
const removeFavoriteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicleId = Number(id);

    await query('DELETE FROM vehicle_favorites WHERE user_id = ? AND vehicle_id = ?', [req.user.id, vehicleId]);

    res.json({
      success: true,
      is_favorite: false,
      message: 'Véhicule retiré des favoris.',
      vehicle_id: vehicleId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/vehicles/:id/favorite
 * @desc    Vérifier si un véhicule spécifique est en favori
 * @access  Privé
 */
const checkFavoriteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const favCheck = await query(
      'SELECT id FROM vehicle_favorites WHERE user_id = ? AND vehicle_id = ? LIMIT 1',
      [req.user.id, Number(id)]
    );

    res.json({
      success: true,
      vehicle_id: Number(id),
      is_favorite: Boolean(favCheck && favCheck.length > 0)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  VALID_STATUSES,
  getVehicles,
  getVehicleById,
  getSimilarVehicles,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
  getUserFavorites,
  toggleFavoriteVehicle,
  removeFavoriteVehicle,
  checkFavoriteVehicle
};
