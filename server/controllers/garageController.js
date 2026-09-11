const { query } = require('../config/database');

/**
 * Helper: Résout l'ID du garage (soit un ID numérique, soit 'me' pour l'utilisateur connecté)
 */
const resolveGarageId = async (idParam, userId) => {
  if (!idParam || idParam === 'me' || idParam === 'profile') {
    if (userId) {
      const garages = await query('SELECT * FROM garages WHERE user_id = ? LIMIT 1', [userId]);
      return garages.length > 0 ? garages[0].id : null;
    }
    return null;
  }
  const numericId = Number(idParam);
  return isNaN(numericId) ? null : numericId;
};

/**
 * Helper: Génère le lien WhatsApp direct avec message pré-rempli
 */
const buildWhatsAppUrl = (phone, garageName) => {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return null;
  const text = encodeURIComponent(`Bonjour ${garageName || 'le garage'}, je vous contacte via CONGOCAR au sujet d'une intervention sur mon véhicule.`);
  return `https://wa.me/${cleanPhone}?text=${text}`;
};

/**
 * @route   GET /api/garages
 * @desc    Lister les garages partenaires avec filtres (commune, ville, 24/7, recherche, statut validation)
 * @access  Public (les utilisateurs voient les garages validés ; les admins peuvent voir tous les statuts)
 */
const getAllGarages = async (req, res, next) => {
  try {
    const {
      commune,
      ville,
      specialty,
      specialite,
      is_open_24h,
      isOpen24h,
      search,
      q,
      statut_validation,
      admin_view,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let sql = 'SELECT * FROM garages WHERE 1=1';
    const params = [];

    const isAdminView = admin_view === 'true' || admin_view === '1';

    // 1. Filtrage par statut de validation
    if (isAdminView && statut_validation && statut_validation !== 'all') {
      sql += ' AND statut_validation = ?';
      params.push(statut_validation);
    } else if (!isAdminView) {
      // Pour le grand public : uniquement les garages validés et vérifiés
      sql += ' AND statut_validation = ?';
      params.push('valide');
    }

    // 2. Filtrage par commune
    if (commune && commune !== 'all') {
      sql += ' AND LOWER(commune) = LOWER(?)';
      params.push(commune.trim());
    }

    // 3. Filtrage par ville
    if (ville && ville !== 'all') {
      sql += ' AND LOWER(ville) = LOWER(?)';
      params.push(ville.trim());
    }

    // 4. Filtrage 24/7
    const open24hParam = is_open_24h !== undefined ? is_open_24h : isOpen24h;
    if (open24hParam === 'true' || open24hParam === '1') {
      sql += ' AND is_open_24h = 1';
    }

    // 5. Filtrage par spécialité
    const spec = specialty || specialite;
    if (spec && spec !== 'all') {
      sql += ' AND (nom LIKE ? OR specialties LIKE ?)';
      params.push(`%${spec.trim()}%`, `%${spec.trim()}%`);
    }

    // 6. Recherche textuelle (nom, commune, adresse, ville, spécialité)
    const searchTerm = search || q;
    if (searchTerm && searchTerm.trim() !== '') {
      sql += ' AND (nom LIKE ? OR adresse LIKE ? OR commune LIKE ? OR ville LIKE ?)';
      const kw = `%${searchTerm.trim()}%`;
      params.push(kw, kw, kw, kw);
    }

    sql += ' ORDER BY rating DESC, is_open_24h DESC';

    const allGarages = await query(sql, params);
    const totalCount = allGarages.length;
    const paginatedGarages = allGarages.slice(offset, offset + limitNum);

    // Harmonisation et enrichissement des données pour chaque garage
    const formatted = paginatedGarages.map(g => {
      let specialtiesList = [];
      if (typeof g.specialties === 'string') {
        try { specialtiesList = JSON.parse(g.specialties); } catch (e) { specialtiesList = [g.specialties]; }
      } else if (Array.isArray(g.specialties)) {
        specialtiesList = g.specialties;
      }

      return {
        ...g,
        name: g.nom || g.name,
        address: g.adresse || g.address,
        phone: g.telephone || g.phone,
        opening_hours: g.horaires || g.opening_hours,
        whatsapp_url: buildWhatsAppUrl(g.whatsapp || g.telephone, g.nom),
        specialties: specialtiesList,
        is_open_24h: Boolean(g.is_open_24h),
        has_towing_truck: Boolean(g.has_towing_truck),
        has_mobile_mechanic: Boolean(g.has_mobile_mechanic),
        verified: Boolean(g.verified),
        statut_validation: g.statut_validation || (g.verified ? 'valide' : 'en_attente')
      };
    });

    res.json({
      success: true,
      total: totalCount,
      count: formatted.length,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      data: formatted,
      garages: formatted // compatibilité rétroactive
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/garages/:id
 * @desc    Obtenir la fiche détaillée d'un garage avec ses services, photos et coordonnées
 * @access  Public
 */
const getGarageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveGarageId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const rows = await query('SELECT * FROM garages WHERE id = ? LIMIT 1', [resolvedId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const g = rows[0];

    // Récupérer les services et photos associés
    const services = await query('SELECT * FROM garage_services WHERE garage_id = ?', [resolvedId]);
    const photos = await query('SELECT * FROM garage_images WHERE garage_id = ?', [resolvedId]);

    let specialtiesList = [];
    if (typeof g.specialties === 'string') {
      try { specialtiesList = JSON.parse(g.specialties); } catch (e) { specialtiesList = [g.specialties]; }
    } else if (Array.isArray(g.specialties)) {
      specialtiesList = g.specialties;
    }

    const formatted = {
      ...g,
      name: g.nom || g.name,
      address: g.adresse || g.address,
      phone: g.telephone || g.phone,
      opening_hours: g.horaires || g.opening_hours,
      whatsapp_url: buildWhatsAppUrl(g.whatsapp || g.telephone, g.nom),
      specialties: specialtiesList,
      is_open_24h: Boolean(g.is_open_24h),
      has_towing_truck: Boolean(g.has_towing_truck),
      has_mobile_mechanic: Boolean(g.has_mobile_mechanic),
      verified: Boolean(g.verified),
      statut_validation: g.statut_validation || (g.verified ? 'valide' : 'en_attente'),
      services: services || [],
      photos: photos || []
    };

    res.json({
      success: true,
      data: formatted,
      garage: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/garages/me
 * @desc    Obtenir le profil du garage de l'utilisateur connecté
 * @access  Privé (Connecté, Garage ou Admin)
 */
const getMyGarageProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const rows = await query('SELECT * FROM garages WHERE user_id = ? LIMIT 1', [userId]);

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        has_garage: false,
        data: null,
        message: 'Aucun garage enregistré sur votre compte utilisateur. Vous pouvez créer votre garage via POST /api/garages.'
      });
    }

    const g = rows[0];
    const services = await query('SELECT * FROM garage_services WHERE garage_id = ?', [g.id]);
    const photos = await query('SELECT * FROM garage_images WHERE garage_id = ?', [g.id]);

    const formatted = {
      ...g,
      name: g.nom || g.name,
      address: g.adresse || g.address,
      phone: g.telephone || g.phone,
      opening_hours: g.horaires || g.opening_hours,
      whatsapp_url: buildWhatsAppUrl(g.whatsapp || g.telephone, g.nom),
      services: services || [],
      photos: photos || [],
      has_garage: true
    };

    res.json({
      success: true,
      has_garage: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/garages & POST /api/garages/register
 * @desc    Inscription d'un nouveau garage partenaire (validation administrateur requise par défaut)
 * @access  Privé (Tout utilisateur authentifié ou Admin)
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
      telephone_urgence,
      whatsapp,
      email,
      ville = 'Kinshasa',
      province = 'Kinshasa',
      latitude = -4.32,
      longitude = 15.31,
      description = '',
      horaires = 'Lun - Sam : 08h00 - 18h00',
      is_open_24h = false,
      has_towing_truck = false,
      has_mobile_mechanic = false,
      specialties = ['Mécanique générale', 'Entretien courant'],
      photo_url = 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80',
      banner_url = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
      services = [],
      photos = []
    } = req.body;

    const garageName = (nom || name || '').trim();
    const garagePhone = (telephone || phone || '').trim();
    const garageAddress = (adresse || address || '').trim();
    const garageCommune = (commune || '').trim();
    const garageWhatsapp = (whatsapp || garagePhone).trim();

    if (!garageName || !garageCommune || !garagePhone || !garageAddress) {
      return res.status(400).json({
        success: false,
        message: 'Champs obligatoires manquants : Nom du garage, Commune, Adresse et Téléphone sont requis pour l\'inscription.'
      });
    }

    const userId = req.user ? req.user.id : null;

    // Vérifier si l'utilisateur possède déjà un garage (hors admin)
    if (userId && req.user.role !== 'admin') {
      const existing = await query('SELECT id, nom, statut_validation FROM garages WHERE user_id = ? LIMIT 1', [userId]);
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Vous possédez déjà un garage enregistré (${existing[0].nom}). Vous pouvez modifier son profil via PUT /api/garages/me.`,
          data: existing[0]
        });
      }
    }

    // Statut de validation : les administrateurs valident immédiatement, les utilisateurs standards passent en attente
    const isAdmin = req.user && req.user.role === 'admin';
    const statutValidation = isAdmin ? 'valide' : 'en_attente';
    const isVerified = isAdmin ? 1 : 0;

    const result = await query(`
      INSERT INTO garages 
        (user_id, nom, description, commune, adresse, ville, province, telephone, telephone_urgence, whatsapp, email, latitude, longitude, horaires, is_open_24h, has_towing_truck, has_mobile_mechanic, specialties, photo_url, banner_url, rating, total_reviews, verified, statut_validation, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      userId,
      garageName,
      description || `Atelier de mécanique et de réparation automobile situé à ${garageCommune}, ${ville}.`,
      garageCommune,
      garageAddress,
      ville,
      province,
      garagePhone,
      telephone_urgence || garagePhone,
      garageWhatsapp,
      email || (req.user ? req.user.email : null),
      parseFloat(latitude) || -4.32,
      parseFloat(longitude) || 15.31,
      horaires,
      is_open_24h ? 1 : 0,
      has_towing_truck ? 1 : 0,
      has_mobile_mechanic ? 1 : 0,
      JSON.stringify(Array.isArray(specialties) ? specialties : [specialties]),
      photo_url,
      banner_url,
      5.0,
      0,
      isVerified,
      statutValidation
    ]);

    const newGarageId = result.insertId;

    // Insérer les services initiaux si fournis
    if (Array.isArray(services) && services.length > 0) {
      for (const s of services) {
        await query(`
          INSERT INTO garage_services 
            (garage_id, nom, description, prix_indicatif, duree_estimee, is_disponible, icone, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW())
        `, [
          newGarageId,
          s.nom || s.name || 'Service mécanique',
          s.description || '',
          parseFloat(s.prix_indicatif || s.price) || 0,
          s.duree_estimee || s.duration || '1 heure',
          s.icone || 'tool'
        ]);
      }
    }

    // Insérer les photos initiales si fournies
    if (Array.isArray(photos) && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const pUrl = typeof photos[i] === 'string' ? photos[i] : photos[i].image_url;
        if (pUrl) {
          await query(`
            INSERT INTO garage_images (garage_id, image_url, titre, is_primary, display_order, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
          `, [newGarageId, pUrl, `Photo ${i + 1}`, i === 0 ? 1 : 0, i + 1]);
        }
      }
    }

    // Récupérer la fiche complète créée
    const createdRows = await query('SELECT * FROM garages WHERE id = ?', [newGarageId]);
    const createdGarage = createdRows[0] || {};

    const message = isAdmin
      ? 'Garage enregistré et validé avec succès par l\'administrateur.'
      : 'Votre garage a été enregistré avec succès ! Il est actuellement soumis à la validation de notre équipe administrative avant d\'être publié.';

    res.status(201).json({
      success: true,
      message,
      data: {
        ...createdGarage,
        whatsapp_url: buildWhatsAppUrl(garageWhatsapp, garageName)
      },
      garageId: newGarageId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/garages/:id & PUT /api/garages/me
 * @desc    Modifier le profil et les informations d'un garage (propriétaire ou admin)
 * @access  Privé (Gérant du garage ou Admin)
 */
const updateGarage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveGarageId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const currentRows = await query('SELECT * FROM garages WHERE id = ? LIMIT 1', [resolvedId]);
    if (currentRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const current = currentRows[0];

    // Vérification des droits : seul le propriétaire ou un admin peut modifier
    if (req.user.role !== 'admin' && Number(current.user_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : vous n\'êtes pas le gestionnaire attitré de ce garage.'
      });
    }

    const {
      name,
      nom,
      commune,
      address,
      adresse,
      ville,
      province,
      phone,
      telephone,
      telephone_urgence,
      whatsapp,
      email,
      description,
      horaires,
      is_open_24h,
      has_towing_truck,
      has_mobile_mechanic,
      specialties,
      photo_url,
      banner_url,
      latitude,
      longitude
    } = req.body;

    const updatedNom = nom !== undefined ? nom : (name !== undefined ? name : current.nom);
    const updatedCommune = commune !== undefined ? commune : current.commune;
    const updatedAdresse = adresse !== undefined ? adresse : (address !== undefined ? address : current.adresse);
    const updatedVille = ville !== undefined ? ville : current.ville;
    const updatedProvince = province !== undefined ? province : current.province;
    const updatedTelephone = telephone !== undefined ? telephone : (phone !== undefined ? phone : current.telephone);
    const updatedTelephoneUrgence = telephone_urgence !== undefined ? telephone_urgence : current.telephone_urgence;
    const updatedWhatsapp = whatsapp !== undefined ? whatsapp : current.whatsapp;
    const updatedEmail = email !== undefined ? email : current.email;
    const updatedDescription = description !== undefined ? description : current.description;
    const updatedHoraires = horaires !== undefined ? horaires : current.horaires;
    const updatedIsOpen24h = is_open_24h !== undefined ? (is_open_24h ? 1 : 0) : current.is_open_24h;
    const updatedHasTowing = has_towing_truck !== undefined ? (has_towing_truck ? 1 : 0) : current.has_towing_truck;
    const updatedHasMobile = has_mobile_mechanic !== undefined ? (has_mobile_mechanic ? 1 : 0) : current.has_mobile_mechanic;
    const updatedPhotoUrl = photo_url !== undefined ? photo_url : current.photo_url;
    const updatedBannerUrl = banner_url !== undefined ? banner_url : current.banner_url;
    const updatedLat = latitude !== undefined ? parseFloat(latitude) : current.latitude;
    const updatedLng = longitude !== undefined ? parseFloat(longitude) : current.longitude;

    await query(`
      UPDATE garages SET
        nom = ?,
        description = ?,
        commune = ?,
        adresse = ?,
        ville = ?,
        province = ?,
        telephone = ?,
        telephone_urgence = ?,
        whatsapp = ?,
        email = ?,
        latitude = ?,
        longitude = ?,
        horaires = ?,
        is_open_24h = ?,
        has_towing_truck = ?,
        has_mobile_mechanic = ?,
        photo_url = ?,
        banner_url = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      updatedNom,
      updatedDescription,
      updatedCommune,
      updatedAdresse,
      updatedVille,
      updatedProvince,
      updatedTelephone,
      updatedTelephoneUrgence,
      updatedWhatsapp,
      updatedEmail,
      updatedLat,
      updatedLng,
      updatedHoraires,
      updatedIsOpen24h,
      updatedHasTowing,
      updatedHasMobile,
      updatedPhotoUrl,
      updatedBannerUrl,
      resolvedId
    ]);

    const updatedRows = await query('SELECT * FROM garages WHERE id = ? LIMIT 1', [resolvedId]);
    const updatedGarage = updatedRows[0];

    res.json({
      success: true,
      message: 'Profil du garage mis à jour avec succès.',
      data: {
        ...updatedGarage,
        whatsapp_url: buildWhatsAppUrl(updatedGarage.whatsapp || updatedGarage.telephone, updatedGarage.nom)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/garages/:id/validate & PATCH /api/garages/:id/status
 * @desc    Validation administrative d'un garage (valider, rejeter ou suspendre)
 * @access  Privé (Administrateur uniquement)
 */
const validateGarage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut, status, motif_rejet, reason } = req.body;

    const requestedStatus = (statut || status || '').toLowerCase();
    const validStatuses = ['valide', 'approved', 'en_attente', 'pending', 'rejete', 'rejected'];

    if (!validStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Statuts acceptés : "valide" (ou approved), "en_attente" (ou pending), "rejete" (ou rejected).'
      });
    }

    let normalizedStatus = 'en_attente';
    let isVerified = 0;

    if (requestedStatus === 'valide' || requestedStatus === 'approved') {
      normalizedStatus = 'valide';
      isVerified = 1;
    } else if (requestedStatus === 'rejete' || requestedStatus === 'rejected') {
      normalizedStatus = 'rejete';
      isVerified = 0;
    }

    const rejectionReason = motif_rejet || reason || null;

    await query(`
      UPDATE garages SET 
        statut_validation = ?, 
        verified = ?, 
        motif_rejet = ?,
        updated_at = NOW() 
      WHERE id = ?
    `, [normalizedStatus, isVerified, rejectionReason, id]);

    const updatedRows = await query('SELECT * FROM garages WHERE id = ? LIMIT 1', [id]);
    if (updatedRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    res.json({
      success: true,
      message: `Statut de validation du garage mis à jour : [${normalizedStatus.toUpperCase()}].`,
      data: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/garages/:id/services
 * @desc    Obtenir la liste des services proposés par un garage
 * @access  Public
 */
const getGarageServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveGarageId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const services = await query('SELECT * FROM garage_services WHERE garage_id = ? ORDER BY id ASC', [resolvedId]);

    res.json({
      success: true,
      garage_id: resolvedId,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/garages/:id/services & POST /api/garages/me/services
 * @desc    Ajouter une prestation/service au catalogue du garage
 * @access  Privé (Gérant du garage ou Admin)
 */
const addGarageService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveGarageId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const {
      nom,
      name,
      description = '',
      prix_indicatif,
      price,
      duree_estimee,
      duration = '1 heure',
      is_disponible = true,
      icone = 'tool'
    } = req.body;

    const serviceNom = nom || name;
    if (!serviceNom) {
      return res.status(400).json({ success: false, message: 'Le nom du service est obligatoire.' });
    }

    const result = await query(`
      INSERT INTO garage_services 
        (garage_id, nom, description, prix_indicatif, duree_estimee, is_disponible, icone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      resolvedId,
      serviceNom.trim(),
      description.trim(),
      parseFloat(prix_indicatif !== undefined ? prix_indicatif : price) || 0,
      duree_estimee || duration,
      is_disponible ? 1 : 0,
      icone
    ]);

    const createdRows = await query('SELECT * FROM garage_services WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Service ajouté avec succès au catalogue du garage.',
      data: createdRows[0] || { id: result.insertId, nom: serviceNom }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/garages/services/:serviceId
 * @desc    Supprimer un service du catalogue
 * @access  Privé (Gérant du garage ou Admin)
 */
const deleteGarageService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    const serviceRows = await query('SELECT * FROM garage_services WHERE id = ? LIMIT 1', [serviceId]);
    if (serviceRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service introuvable.' });
    }

    await query('DELETE FROM garage_services WHERE id = ?', [serviceId]);

    res.json({
      success: true,
      message: 'Service supprimé avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/garages/:id/photos
 * @desc    Obtenir la galerie de photos d'un garage
 * @access  Public
 */
const getGaragePhotos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveGarageId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const photos = await query('SELECT * FROM garage_images WHERE garage_id = ?', [resolvedId]);

    res.json({
      success: true,
      garage_id: resolvedId,
      count: photos.length,
      data: photos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/garages/:id/photos & POST /api/garages/me/photos
 * @desc    Ajouter une photo à la galerie de l'atelier
 * @access  Privé (Gérant du garage ou Admin)
 */
const addGaragePhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveGarageId(id, req.user?.id);

    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const { image_url, url, titre = '', title = '', is_primary = false, display_order = 1 } = req.body;
    const targetUrl = image_url || url;

    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'L\'URL de l\'image est obligatoire.' });
    }

    const result = await query(`
      INSERT INTO garage_images (garage_id, image_url, titre, is_primary, display_order, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [resolvedId, targetUrl.trim(), titre || title, is_primary ? 1 : 0, Number(display_order) || 1]);

    res.status(201).json({
      success: true,
      message: 'Photo ajoutée avec succès à la galerie de l\'atelier.',
      photoId: result.insertId,
      data: {
        id: result.insertId,
        garage_id: resolvedId,
        image_url: targetUrl,
        titre: titre || title,
        is_primary: is_primary ? 1 : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/garages/photos/:photoId
 * @desc    Supprimer une photo de la galerie
 * @access  Privé (Gérant du garage ou Admin)
 */
const deleteGaragePhoto = async (req, res, next) => {
  try {
    const { photoId } = req.params;

    await query('DELETE FROM garage_images WHERE id = ?', [photoId]);

    res.json({
      success: true,
      message: 'Photo retirée avec succès.'
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
        message: 'Nom, téléphone, commune et description de la panne sont requis pour le dépannage d\'urgence.'
      });
    }

    const result = await query(`
      INSERT INTO breakdown_requests 
        (user_id, garage_id, client_name, client_phone, commune, car_model, issue_description, status, emergency_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente', ?, NOW(), NOW())
    `, [
      req.user ? req.user.id : null,
      garage_id || 1,
      client_name.trim(),
      client_phone.trim(),
      commune.trim(),
      car_model.trim(),
      issue_description.trim(),
      emergency_level
    ]);

    res.status(201).json({
      success: true,
      message: 'Demande de dépannage transmise avec succès aux équipes d\'intervention de garde.',
      requestId: result.insertId,
      data: {
        id: result.insertId,
        garage_id: garage_id || 1,
        client_name,
        commune,
        emergency_level
      }
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
      data: requests,
      requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/garages/sos-breakdown/:id/status
 * @desc    Mettre à jour le statut d'une intervention SOS
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
  getMyGarageProfile,
  createGarage,
  registerGarage: createGarage,
  updateGarage,
  validateGarage,
  getGarageServices,
  addGarageService,
  deleteGarageService,
  getGaragePhotos,
  addGaragePhoto,
  deleteGaragePhoto,
  createBreakdownRequest,
  getBreakdownRequests,
  updateBreakdownStatus
};
