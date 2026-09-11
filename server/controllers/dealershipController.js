const { query } = require('../config/database');

/**
 * Helper: Récupère la concession appartenant à l'utilisateur connecté
 */
const getDealerByUserId = async (userId) => {
  const dealerships = await query('SELECT * FROM dealerships WHERE user_id = ? LIMIT 1', [userId]);
  return dealerships.length > 0 ? dealerships[0] : null;
};

/**
 * Helper: Résout l'ID de la concession (soit un ID numérique, soit 'me' pour l'utilisateur connecté)
 */
const resolveDealershipId = async (idParam, userId) => {
  if (!idParam || idParam === 'me' || idParam === 'profile') {
    if (userId) {
      const dealer = await getDealerByUserId(userId);
      return dealer ? dealer.id : null;
    }
    return null;
  }
  const numericId = Number(idParam);
  return isNaN(numericId) ? null : numericId;
};

/**
 * @route   GET /api/dealers & GET /api/dealerships
 * @desc    Obtenir la liste des concessions automobiles partenaires avec filtres et compteurs
 * @access  Public
 */
const getDealerships = async (req, res, next) => {
  try {
    const { search, ville, plan_id, page = 1, limit = 20, sort = 'rating-desc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = ['1=1'];
    let params = [];

    if (search) {
      whereClauses.push('(d.nom LIKE ? OR d.slogan LIKE ? OR d.adresse LIKE ? OR d.ville LIKE ?)');
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (ville && ville.toLowerCase() !== 'all') {
      whereClauses.push('d.ville = ?');
      params.push(ville.trim());
    }

    if (plan_id) {
      whereClauses.push('d.plan_id = ?');
      params.push(plan_id);
    }

    const whereSql = whereClauses.join(' AND ');

    // Récupérer les concessions avec métriques de stock
    const dealerships = await query(
      `SELECT d.*, 
              COUNT(v.id) AS total_vehicles,
              SUM(CASE WHEN v.status = 'approved' THEN 1 ELSE 0 END) AS available_vehicles,
              SUM(CASE WHEN v.status = 'sold' THEN 1 ELSE 0 END) AS sold_vehicles
       FROM dealerships d
       LEFT JOIN vehicles v ON d.id = v.dealership_id
       WHERE ${whereSql}
       GROUP BY d.id
       ORDER BY d.rating DESC, d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM dealerships d WHERE ${whereSql}`,
      params
    );

    const total = countResult[0]?.total || dealerships.length;

    res.json({
      success: true,
      count: dealerships.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
      hasPrevPage: parseInt(page) > 1,
      hasNextPage: parseInt(page) * parseInt(limit) < total,
      data: dealerships
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dealers/:id & GET /api/dealerships/:id
 * @desc    Obtenir le profil complet d'une concession avec son stock de véhicules et statistiques
 * @access  Public
 */
const getDealershipById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveDealershipId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({
        success: false,
        message: 'Concession automobile introuvable.'
      });
    }

    const dealerships = await query(
      `SELECT d.*, u.name as owner_name, u.email as owner_email
       FROM dealerships d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = ? LIMIT 1`,
      [resolvedId]
    );

    if (dealerships.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Concession automobile introuvable.'
      });
    }

    const dealership = dealerships[0];

    // Véhicules en stock approuvés et visibles
    const vehicles = await query(
      `SELECT v.*, 
              (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = v.id ORDER BY vi.is_primary DESC, vi.display_order ASC LIMIT 1) AS primary_image
       FROM vehicles v
       WHERE v.dealership_id = ? AND v.status = 'approved'
       ORDER BY v.en_vedette DESC, v.created_at DESC`,
      [resolvedId]
    );

    // Véhicules vendus récents (pour vitrine de crédibilité)
    const soldVehicles = await query(
      `SELECT v.id, v.marque, v.modele, v.annee, v.prix, v.categorie,
              (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = v.id ORDER BY vi.is_primary DESC, vi.display_order ASC LIMIT 1) AS primary_image
       FROM vehicles v
       WHERE v.dealership_id = ? AND v.status = 'sold'
       ORDER BY v.updated_at DESC
       LIMIT 4`,
      [resolvedId]
    );

    res.json({
      success: true,
      data: {
        ...dealership,
        stats: {
          total_active_stock: vehicles.length,
          total_sold_showcase: soldVehicles.length
        },
        vehicles,
        sold_vehicles: soldVehicles
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dealers/me & GET /api/dealers/profile
 * @desc    Obtenir le profil de la concession de l'utilisateur connecté
 * @access  Private (Dealer, Admin)
 */
const getCurrentDealerProfile = async (req, res, next) => {
  try {
    const dealer = await getDealerByUserId(req.user.id);

    if (!dealer) {
      return res.json({
        success: true,
        has_dealership: false,
        data: null,
        message: 'Aucune concession automobile n\'est encore associée à ce compte.'
      });
    }

    // Récupérer le nombre de véhicules et de demandes en attente
    const stockCount = await query('SELECT COUNT(*) AS total FROM vehicles WHERE dealership_id = ?', [dealer.id]);
    const unreadLeads = await query('SELECT COUNT(*) AS total FROM leads WHERE dealership_id = ? AND statut = "nouveau"', [dealer.id]);

    res.json({
      success: true,
      has_dealership: true,
      data: {
        ...dealer,
        total_vehicles: stockCount[0]?.total || 0,
        unread_inquiries_count: unreadLeads[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/dealers & POST /api/dealerships
 * @desc    Créer son profil concessionnaire officiel sur CONGOCAR
 * @access  Private (Connecté)
 */
const createDealership = async (req, res, next) => {
  try {
    const {
      nom,
      slogan,
      description,
      adresse,
      commune = 'Gombe',
      ville = 'Kinshasa',
      province,
      code_postal,
      telephone,
      whatsapp,
      email,
      horaires = 'Lun - Sam : 08h00 - 18h00',
      site_web,
      logo_url,
      banner_url,
      siret,
      rccm,
      id_nat,
      nif,
      dealership_type = 'independant',
      plan_id = 'starter'
    } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la concession automobile est obligatoire.'
      });
    }

    if (!telephone || !telephone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le numéro de téléphone principal de contact est obligatoire.'
      });
    }

    // Vérifier si l'utilisateur possède déjà une concession
    const existing = await getDealerByUserId(req.user.id);
    if (existing && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Vous disposez déjà d\'une concession enregistrée sur votre compte.',
        data: existing
      });
    }

    const contactEmail = email || req.user.email;

    const result = await query(
      `INSERT INTO dealerships 
        (user_id, nom, slogan, description, adresse, commune, ville, province, code_postal, telephone, whatsapp, email, horaires, site_web, logo_url, banner_url, siret, rccm, id_nat, nif, dealership_type, plan_id, statut_abonnement, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'essai_gratuit', NOW(), NOW())`,
      [
        req.user.id,
        nom.trim(),
        slogan || 'Showroom automobile d\'exception',
        description || `Concessionnaire automobile à ${ville}. Vente de véhicules neufs et d'occasion contrôlés.`,
        adresse || 'Boulevard du 30 Juin',
        commune,
        ville,
        province || ville,
        code_postal || null,
        telephone.trim(),
        whatsapp || telephone.trim(),
        contactEmail,
        horaires,
        site_web || null,
        logo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
        banner_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        siret || null,
        rccm || null,
        id_nat || null,
        nif || null,
        dealership_type,
        plan_id
      ]
    );

    // Mettre à jour le rôle de l'utilisateur en 'dealer' s'il était simple 'user' ou 'seller'
    if (req.user.role !== 'admin' && req.user.role !== 'dealer') {
      await query('UPDATE users SET role = "dealer", updated_at = NOW() WHERE id = ?', [req.user.id]);
    }

    const newDealership = await query('SELECT * FROM dealerships WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Profil de concession automobile créé avec succès sur CONGOCAR.',
      data: newDealership[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/dealers/:id & PUT /api/dealers/me & PUT /api/dealerships/:id
 * @desc    Modifier les informations et les coordonnées du profil concessionnaire
 * @access  Private (Dealer propriétaire ou Admin)
 */
const updateDealership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveDealershipId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Concession automobile introuvable.' });
    }

    const existing = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [resolvedId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Concession automobile introuvable.' });
    }

    // Vérifier les droits d'accès
    if (req.user.role !== 'admin' && Number(existing[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Action non autorisée. Vous n\'êtes pas le propriétaire de cette concession.'
      });
    }

    const fields = [
      'nom', 'slogan', 'description', 'adresse', 'commune', 'ville', 'province',
      'code_postal', 'telephone', 'whatsapp', 'email', 'horaires', 'site_web',
      'logo_url', 'banner_url', 'siret', 'rccm', 'id_nat', 'nif', 'dealership_type', 'plan_id'
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
      return res.status(400).json({ success: false, message: 'Aucun champ à modifier n\'a été transmis.' });
    }

    updateClauses.push('updated_at = NOW()');
    params.push(resolvedId);

    await query(`UPDATE dealerships SET ${updateClauses.join(', ')} WHERE id = ?`, params);

    const updated = await query('SELECT * FROM dealerships WHERE id = ?', [resolvedId]);

    res.json({
      success: true,
      message: 'Profil de la concession mis à jour avec succès.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/dealers/:id/vehicles & POST /api/dealers/me/vehicles
 * @desc    Permettre au concessionnaire d'ajouter un nouveau véhicule directement à son stock
 * @access  Private (Dealer propriétaire ou Admin)
 */
const addDealerVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveDealershipId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    const dealer = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [resolvedId]);
    if (dealer.length === 0) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    if (req.user.role !== 'admin' && Number(dealer[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Non autorisé à ajouter un véhicule pour cette concession.' });
    }

    const {
      marque,
      modele,
      finition,
      annee = new Date().getFullYear(),
      prix = 0,
      prix_promo,
      categorie = 'Berline',
      carburant = 'Essence',
      transmission = 'Automatique',
      kilometrage = 0,
      etat = 'Occasion',
      puissance,
      couleur,
      portes = 5,
      places = 5,
      description,
      options,
      en_promo = false,
      en_vedette = false,
      images = []
    } = req.body;

    if (!marque || !modele) {
      return res.status(400).json({ success: false, message: 'La marque et le modèle sont obligatoires.' });
    }

    // Statut initial : approuvé directement pour les concessions vérifiées ou admin, sinon pending
    const initialStatus = (dealer[0].verified === 1 || req.user.role === 'admin') ? 'approved' : 'pending';

    const insertResult = await query(
      `INSERT INTO vehicles (
        dealership_id, user_id, marque, modele, finition, annee, prix, prix_promo,
        categorie, carburant, transmission, kilometrage, etat, puissance, couleur,
        portes, places, description, options, ville, en_promo, en_vedette, status,
        vues_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [
        resolvedId,
        req.user.id,
        marque.trim(),
        modele.trim(),
        finition || null,
        parseInt(annee),
        parseFloat(prix),
        prix_promo ? parseFloat(prix_promo) : null,
        categorie,
        carburant,
        transmission,
        parseInt(kilometrage),
        etat,
        puissance || null,
        couleur || null,
        parseInt(portes),
        parseInt(places),
        description || null,
        Array.isArray(options) ? JSON.stringify(options) : options || null,
        dealer[0].ville || 'Kinshasa',
        en_promo ? 1 : 0,
        en_vedette ? 1 : 0,
        initialStatus
      ]
    );

    const vehicleId = insertResult.insertId;

    // Enregistrer les images
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].image_url;
        if (imgUrl) {
          await query(
            `INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, display_order, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [vehicleId, imgUrl, i === 0 ? 1 : 0, i + 1]
          );
        }
      }
    }

    const createdCar = await query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

    res.status(201).json({
      success: true,
      message: initialStatus === 'approved' 
        ? 'Véhicule ajouté avec succès à votre stock et immédiatement publié !'
        : 'Véhicule ajouté à votre stock en attente de validation (statut pending).',
      data: createdCar[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dealers/:id/stock & GET /api/dealers/me/stock
 * @desc    Permettre au concessionnaire de gérer l'inventaire de son stock (filtrer par statut, recherche, tri)
 * @access  Private (Dealer propriétaire ou Admin)
 */
const getDealerStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveDealershipId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    const dealer = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [resolvedId]);
    if (dealer.length === 0) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    if (req.user.role !== 'admin' && Number(dealer[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Non autorisé à gérer le stock de cette concession.' });
    }

    const { status = 'all', search, sort = 'recent', page = 1, limit = 25 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = ['v.dealership_id = ?'];
    let params = [resolvedId];

    if (status && status.toLowerCase() !== 'all') {
      whereClauses.push('v.status = ?');
      params.push(status.toLowerCase());
    }

    if (search) {
      whereClauses.push('(v.marque LIKE ? OR v.modele LIKE ? OR v.vin LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    let orderBy = 'v.created_at DESC';
    if (sort === 'prix-asc') orderBy = 'v.prix ASC';
    if (sort === 'prix-desc') orderBy = 'v.prix DESC';
    if (sort === 'vues-desc') orderBy = 'v.vues_count DESC';
    if (sort === 'annee-desc') orderBy = 'v.annee DESC';

    const whereSql = whereClauses.join(' AND ');

    const vehicles = await query(
      `SELECT v.*, 
              (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = v.id ORDER BY vi.is_primary DESC, vi.display_order ASC LIMIT 1) AS primary_image
       FROM vehicles v
       WHERE ${whereSql}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Calculer les compteurs rapides de stock
    const allStock = await query('SELECT status, prix FROM vehicles WHERE dealership_id = ?', [resolvedId]);
    const summary = {
      total: allStock.length,
      approved: allStock.filter(v => v.status === 'approved').length,
      pending: allStock.filter(v => v.status === 'pending').length,
      sold: allStock.filter(v => v.status === 'sold').length,
      inactive: allStock.filter(v => v.status === 'inactive').length,
      rejected: allStock.filter(v => v.status === 'rejected').length,
      total_stock_value: allStock.filter(v => v.status === 'approved').reduce((sum, v) => sum + (Number(v.prix) || 0), 0)
    };

    res.json({
      success: true,
      count: vehicles.length,
      summary,
      page: parseInt(page),
      limit: parseInt(limit),
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/dealers/:id/stock/:vehicleId/status & PATCH /api/dealers/stock/:vehicleId
 * @desc    Mettre à jour rapidement le statut d'un véhicule du stock (sold, inactive, approved, pending)
 * @access  Private (Dealer propriétaire ou Admin)
 */
const updateStockVehicleStatus = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { status, prix, en_promo, prix_promo, en_vedette } = req.body;

    const vehicle = await query('SELECT * FROM vehicles WHERE id = ? LIMIT 1', [vehicleId]);
    if (vehicle.length === 0) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    const dealer = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [vehicle[0].dealership_id]);
    if (req.user.role !== 'admin' && (!dealer.length || Number(dealer[0].user_id) !== Number(req.user.id))) {
      return res.status(403).json({ success: false, message: 'Non autorisé à modifier ce véhicule.' });
    }

    let updates = [];
    let params = [];

    if (status) {
      const validStatuses = ['approved', 'pending', 'sold', 'inactive', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Statut invalide. Autorisés: ${validStatuses.join(', ')}` });
      }
      updates.push('status = ?');
      params.push(status);
    }

    if (prix !== undefined) {
      updates.push('prix = ?');
      params.push(parseFloat(prix));
    }

    if (en_promo !== undefined) {
      updates.push('en_promo = ?');
      params.push(en_promo ? 1 : 0);
    }

    if (prix_promo !== undefined) {
      updates.push('prix_promo = ?');
      params.push(prix_promo ? parseFloat(prix_promo) : null);
    }

    if (en_vedette !== undefined) {
      updates.push('en_vedette = ?');
      params.push(en_vedette ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun changement spécifié.' });
    }

    updates.push('updated_at = NOW()');
    params.push(vehicleId);

    await query(`UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

    res.json({
      success: true,
      message: `Véhicule mis à jour avec succès dans le stock.`,
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dealers/:id/stats & GET /api/dealers/me/stats
 * @desc    Consulter les statistiques complètes de performance de la concession (ventes, vues, stock, leads)
 * @access  Private (Dealer propriétaire ou Admin)
 */
const getDealerStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveDealershipId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    const dealer = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [resolvedId]);
    if (dealer.length === 0) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    if (req.user.role !== 'admin' && Number(dealer[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Non autorisé à consulter les statistiques de cette concession.' });
    }

    // 1. Statistiques des véhicules
    const vehicles = await query('SELECT * FROM vehicles WHERE dealership_id = ?', [resolvedId]);

    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'approved').length;
    const pendingVehicles = vehicles.filter(v => v.status === 'pending').length;
    const soldVehicles = vehicles.filter(v => v.status === 'sold').length;
    const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;

    const totalViews = vehicles.reduce((sum, v) => sum + (Number(v.vues_count) || 0), 0);
    const totalFavorites = vehicles.reduce((sum, v) => sum + (Number(v.favorites_count) || 0), 0);

    const totalStockValue = vehicles
      .filter(v => v.status === 'approved')
      .reduce((sum, v) => sum + (Number(v.prix) || 0), 0);

    const totalSoldValue = vehicles
      .filter(v => v.status === 'sold')
      .reduce((sum, v) => sum + (Number(v.prix) || 0), 0);

    const avgPrice = availableVehicles > 0 ? Math.round(totalStockValue / availableVehicles) : 0;

    // 2. Top 5 des véhicules les plus consultés
    const topVehicles = [...vehicles]
      .sort((a, b) => (Number(b.vues_count) || 0) - (Number(a.vues_count) || 0))
      .slice(0, 5)
      .map(v => ({
        id: v.id,
        title: `${v.marque} ${v.modele} ${v.annee}`,
        prix: v.prix,
        vues_count: v.vues_count || 0,
        status: v.status
      }));

    // 3. Répartition par catégorie
    const categoriesCount = {};
    vehicles.forEach(v => {
      const cat = v.categorie || 'Autre';
      categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });

    // 4. Statistiques des leads / demandes clients
    const leads = await query('SELECT * FROM leads WHERE dealership_id = ?', [resolvedId]);
    const totalInquiries = leads.length;
    const unreadInquiries = leads.filter(l => l.statut === 'nouveau').length;

    const inquiriesByStatus = {
      nouveau: leads.filter(l => l.statut === 'nouveau').length,
      en_cours: leads.filter(l => l.statut === 'en_cours').length,
      traite: leads.filter(l => l.statut === 'traite').length,
      archive: leads.filter(l => l.statut === 'archive').length
    };

    const inquiriesByType = {
      essai: leads.filter(l => l.type_demande === 'essai').length,
      devis: leads.filter(l => l.type_demande === 'devis').length,
      achat: leads.filter(l => l.type_demande === 'achat').length,
      information: leads.filter(l => l.type_demande === 'information').length,
      reprise: leads.filter(l => l.type_demande === 'reprise').length
    };

    res.json({
      success: true,
      dealership: {
        id: dealer[0].id,
        nom: dealer[0].nom,
        rating: dealer[0].rating,
        reviews_count: dealer[0].reviews_count
      },
      inventory: {
        total_vehicles: totalVehicles,
        available_vehicles: availableVehicles,
        pending_vehicles: pendingVehicles,
        sold_vehicles: soldVehicles,
        inactive_vehicles: inactiveVehicles,
        total_stock_value_usd: totalStockValue,
        total_sold_value_usd: totalSoldValue,
        average_price_usd: avgPrice,
        categories_distribution: categoriesCount
      },
      engagement: {
        total_views: totalViews,
        total_favorites: totalFavorites
      },
      inquiries: {
        total: totalInquiries,
        unread: unreadInquiries,
        by_status: inquiriesByStatus,
        by_type: inquiriesByType
      },
      top_viewed_vehicles: topVehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/dealers/:id/inquiries & POST /api/dealers/:id/contact
 * @desc    Recevoir les demandes de clients (réservation d'essai, offre de reprise, devis, achat)
 * @access  Public
 */
const createCustomerInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveDealershipId(id, null);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Concession automobile introuvable.' });
    }

    const dealer = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [resolvedId]);
    if (dealer.length === 0) {
      return res.status(404).json({ success: false, message: 'Concession automobile introuvable.' });
    }

    const {
      nom_client,
      email,
      telephone,
      message,
      type_demande = 'information',
      vehicle_id,
      date_souhaitee,
      horaire_souhaite,
      offre_prix_proposee,
      vehicule_reprise_info
    } = req.body;

    if (!nom_client || !nom_client.trim()) {
      return res.status(400).json({ success: false, message: 'Votre nom complet est requis.' });
    }
    if (!telephone || !telephone.trim()) {
      return res.status(400).json({ success: false, message: 'Votre numéro de téléphone est requis pour que le concessionnaire puisse vous contacter.' });
    }

    let vehicleTitle = 'Demande générale en concession';
    let vehiclePrice = 0;

    if (vehicle_id) {
      const v = await query('SELECT marque, modele, annee, prix FROM vehicles WHERE id = ? LIMIT 1', [vehicle_id]);
      if (v.length > 0) {
        vehicleTitle = `${v[0].marque} ${v[0].modele} (${v[0].annee})`;
        vehiclePrice = v[0].prix || 0;
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
        resolvedId,
        vehicle_id || null,
        userId,
        vehicleTitle,
        vehiclePrice,
        nom_client.trim(),
        email ? email.toLowerCase().trim() : '',
        telephone.trim(),
        type_demande,
        date_souhaitee || null,
        horaire_souhaite || null,
        message || null,
        offre_prix_proposee ? parseFloat(offre_prix_proposee) : null,
        vehicule_reprise_info || null
      ]
    );

    const createdLead = await query('SELECT * FROM leads WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: `Votre demande a été transmise avec succès à l'équipe de ${dealer[0].nom}. Un conseiller commercial vous recontactera très rapidement.`,
      reference_number: `LEAD-${result.insertId}-${Date.now().toString().slice(-4)}`,
      data: createdLead[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dealers/:id/inquiries & GET /api/dealers/me/inquiries
 * @desc    Consulter les demandes clients reçues par le concessionnaire
 * @access  Private (Dealer propriétaire ou Admin)
 */
const getDealerInquiries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveDealershipId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    const dealer = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [resolvedId]);
    if (dealer.length === 0) {
      return res.status(404).json({ success: false, message: 'Concession introuvable.' });
    }

    if (req.user.role !== 'admin' && Number(dealer[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Non autorisé à consulter les demandes de cette concession.' });
    }

    const { statut = 'all', type_demande, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = ['l.dealership_id = ?'];
    let params = [resolvedId];

    if (statut && statut.toLowerCase() !== 'all') {
      whereClauses.push('l.statut = ?');
      params.push(statut.toLowerCase());
    }

    if (type_demande) {
      whereClauses.push('l.type_demande = ?');
      params.push(type_demande);
    }

    const whereSql = whereClauses.join(' AND ');

    const inquiries = await query(
      `SELECT l.* FROM leads l WHERE ${whereSql} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Compteurs rapides
    const allInquiries = await query('SELECT statut FROM leads WHERE dealership_id = ?', [resolvedId]);
    const unreadCount = allInquiries.filter(i => i.statut === 'nouveau').length;

    res.json({
      success: true,
      count: inquiries.length,
      unread_count: unreadCount,
      total: allInquiries.length,
      page: parseInt(page),
      limit: parseInt(limit),
      data: inquiries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/dealers/inquiries/:inquiryId & PATCH /api/dealers/:id/inquiries/:inquiryId
 * @desc    Traiter une demande client (marquer comme contacté, traité, archivé, ajouter note interne)
 * @access  Private (Dealer propriétaire ou Admin)
 */
const updateDealerInquiryStatus = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const { statut, notes_internes } = req.body;

    const lead = await query('SELECT * FROM leads WHERE id = ? LIMIT 1', [inquiryId]);
    if (lead.length === 0) {
      return res.status(404).json({ success: false, message: 'Demande client introuvable.' });
    }

    const dealer = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [lead[0].dealership_id]);
    if (req.user.role !== 'admin' && (!dealer.length || Number(dealer[0].user_id) !== Number(req.user.id))) {
      return res.status(403).json({ success: false, message: 'Non autorisé à gérer cette demande.' });
    }

    const validStatuses = ['nouveau', 'en_cours', 'traite', 'archive'];
    if (statut && !validStatuses.includes(statut)) {
      return res.status(400).json({ success: false, message: `Statut invalide. Autorisés: ${validStatuses.join(', ')}` });
    }

    let updates = [];
    let params = [];

    if (statut) {
      updates.push('statut = ?');
      params.push(statut);
    }

    if (notes_internes !== undefined) {
      updates.push('notes_internes = ?');
      params.push(notes_internes);
    }

    updates.push('updated_at = NOW()');
    params.push(inquiryId);

    await query(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await query('SELECT * FROM leads WHERE id = ?', [inquiryId]);

    res.json({
      success: true,
      message: 'Statut de la demande client mis à jour avec succès.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/dealers/:id
 * @desc    Supprimer une concession automobile (Admin uniquement)
 * @access  Private (Admin uniquement)
 */
const deleteDealership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM dealerships WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Concession automobile introuvable.' });
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
  getCurrentDealerProfile,
  createDealership,
  updateDealership,
  deleteDealership,
  addDealerVehicle,
  getDealerStock,
  updateStockVehicleStatus,
  getDealerStats,
  createCustomerInquiry,
  getDealerInquiries,
  updateDealerInquiryStatus
};
