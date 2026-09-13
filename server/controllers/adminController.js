const bcrypt = require('bcryptjs');
const { query, memoryStore, getIsConnectedToMysql } = require('../config/database');
const { adminStorage, initAdminStore } = require('../config/adminStorage');

// Assure l'initialisation du store mémoire d'administration
initAdminStore(memoryStore);

// ==========================================
// 1. STATISTIQUES & DASHBOARD ADMIN
// ==========================================
/**
 * @route   GET /api/admin/stats
 * @desc    Statistiques globales complètes pour le tableau de bord Super Admin
 * @access  Privé (Admin uniquement)
 */
const getStats = async (req, res, next) => {
  try {
    initAdminStore(memoryStore);

    let usersCount = { total: memoryStore.users.length };
    let vehiclesTotal = memoryStore.vehicles.length;
    let vehiclesApproved = memoryStore.vehicles.filter(v => ['approved', 'disponible'].includes(String(v.status || '').toLowerCase())).length;
    let vehiclesPending = memoryStore.vehicles.filter(v => ['pending', 'en_attente'].includes(String(v.status || '').toLowerCase())).length;
    let vehiclesRejected = memoryStore.vehicles.filter(v => ['rejected', 'rejete'].includes(String(v.status || '').toLowerCase())).length;
    let dealershipsCount = memoryStore.dealerships.length;
    let garagesTotal = memoryStore.garages.length;
    let garagesPending = memoryStore.garages.filter(g => String(g.statut_validation || '').toLowerCase() === 'en_attente').length;
    let leadsCount = memoryStore.leads ? memoryStore.leads.length : 0;
    let reportsTotal = memoryStore.reports.length;
    let reportsPending = memoryStore.reports.filter(r => r.status === 'en_attente').length;
    let subsActive = memoryStore.subscriptions.filter(s => s.statut === 'actif').length;

    // Calcul MRR approximatif
    let mrrUsd = memoryStore.subscriptions
      .filter(s => s.statut === 'actif')
      .reduce((sum, s) => sum + (Number(s.prix_usd) || 0), 0);
    let mrrCdf = memoryStore.subscriptions
      .filter(s => s.statut === 'actif')
      .reduce((sum, s) => sum + (Number(s.prix_cdf) || 0), 0);

    // Paiements totaux
    let totalPaymentsAmount = memoryStore.payments
      .filter(p => p.statut === 'reussi')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    let paymentsCount = memoryStore.payments.length;

    // Répartition utilisateurs par rôle
    const usersByRole = {
      admin: memoryStore.users.filter(u => u.role === 'admin').length,
      dealer: memoryStore.users.filter(u => ['dealer', 'concessionnaire'].includes(u.role)).length,
      garage: memoryStore.users.filter(u => u.role === 'garage').length,
      seller: memoryStore.users.filter(u => ['seller', 'salesperson'].includes(u.role)).length,
      user: memoryStore.users.filter(u => !['admin', 'dealer', 'concessionnaire', 'garage', 'seller', 'salesperson'].includes(u.role)).length
    };

    // Top marques dans le parc
    const marqueCounts = {};
    memoryStore.vehicles.forEach(v => {
      const m = v.marque || 'Autre';
      marqueCounts[m] = (marqueCounts[m] || 0) + 1;
    });
    const marqueStats = Object.keys(marqueCounts)
      .map(marque => ({ marque, count: marqueCounts[marque] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Répartition carburant
    const carburantCounts = {};
    memoryStore.vehicles.forEach(v => {
      const c = v.carburant || 'Essence';
      carburantCounts[c] = (carburantCounts[c] || 0) + 1;
    });
    const carburantStats = Object.keys(carburantCounts)
      .map(carburant => ({ carburant, count: carburantCounts[carburant] }))
      .sort((a, b) => b.count - a.count);

    // Activité récente
    const recentLeads = [...(memoryStore.leads || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    const latestUsers = [...memoryStore.users]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5)
      .map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, created_at: u.created_at }));
    const recentReports = [...memoryStore.reports]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    const recentPayments = [...memoryStore.payments]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalUsers: usersCount.total,
        usersByRole,
        vehicles: {
          total: vehiclesTotal,
          approved: vehiclesApproved,
          pending: vehiclesPending,
          rejected: vehiclesRejected
        },
        dealerships: {
          total: dealershipsCount
        },
        garages: {
          total: garagesTotal,
          pending: garagesPending
        },
        reports: {
          total: reportsTotal,
          pending: reportsPending
        },
        subscriptions: {
          activeCount: subsActive,
          mrrUsd,
          mrrCdf
        },
        payments: {
          totalAmount: totalPaymentsAmount,
          count: paymentsCount
        },
        totalLeads: leadsCount,
        marqueStats,
        carburantStats,
        recentLeads,
        latestUsers,
        recentReports,
        recentPayments
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. GESTION DES UTILISATEURS
// ==========================================
/**
 * @route   GET /api/admin/users
 * @desc    Lister tous les utilisateurs avec filtres et pagination
 * @access  Privé (Admin uniquement)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    let list = [...memoryStore.users];

    if (role && role !== 'all') {
      list = list.filter(u => u.role === role);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paginated = list.slice(offset, offset + Number(limit)).map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      users: paginated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users/:id
 * @desc    Obtenir les détails d'un utilisateur
 * @access  Privé (Admin uniquement)
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = memoryStore.users.find(u => Number(u.id) === Number(id));
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }
    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/users
 * @desc    Créer un compte utilisateur directement depuis le panneau admin
 * @access  Privé (Admin uniquement)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user', phone, city } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nom, email et mot de passe sont obligatoires.' });
    }

    const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'Cette adresse email est déjà utilisée.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newId = memoryStore.users.length > 0 ? Math.max(...memoryStore.users.map(u => Number(u.id))) + 1 : 1;

    const newUser = {
      id: newId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      phone: phone || null,
      city: city || 'Kinshasa',
      avatar: null,
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryStore.users.push(newUser);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, message: 'Utilisateur créé avec succès.', user: safeUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Mettre à jour les informations d'un utilisateur
 * @access  Privé (Admin uniquement)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, is_active, city } = req.body;

    const idx = memoryStore.users.findIndex(u => Number(u.id) === Number(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    const user = memoryStore.users[idx];
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailConflict = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase() && Number(u.id) !== Number(id));
      if (emailConflict) {
        return res.status(409).json({ success: false, message: 'Cet email est déjà attribué à un autre compte.' });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (role) user.role = role;
    if (is_active !== undefined) user.is_active = is_active ? 1 : 0;
    user.updated_at = new Date();

    const { password, ...safeUser } = user;
    res.json({ success: true, message: 'Utilisateur mis à jour avec succès.', user: safeUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Changer le rôle d'un utilisateur
 * @access  Privé (Admin uniquement)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'dealer', 'seller', 'salesperson', 'garage', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide.' });
    }

    const user = memoryStore.users.find(u => Number(u.id) === Number(id));
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    user.role = role;
    user.updated_at = new Date();

    res.json({
      success: true,
      message: `Rôle mis à jour avec succès : ${role}.`,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Activer ou désactiver/bannir un compte utilisateur
 * @access  Privé (Admin uniquement)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const user = memoryStore.users.find(u => Number(u.id) === Number(id));
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Action impossible sur votre propre session active.' });
    }

    user.is_active = is_active !== undefined ? (is_active ? 1 : 0) : (user.is_active === 1 ? 0 : 1);
    user.updated_at = new Date();

    res.json({
      success: true,
      message: `Statut utilisateur : ${user.is_active === 1 ? 'Actif' : 'Suspendu / Désactivé'}.`,
      is_active: user.is_active
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer définitivement un utilisateur
 * @access  Privé (Admin uniquement)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Impossible de supprimer votre propre compte admin.' });
    }

    const idx = memoryStore.users.findIndex(u => Number(u.id) === Number(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    memoryStore.users.splice(idx, 1);
    res.json({ success: true, message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. GESTION DES VÉHICULES & MODÉRATION
// ==========================================
/**
 * @route   GET /api/admin/vehicles
 * @desc    Lister tous les véhicules (y compris en attente et rejetés) avec filtres
 * @access  Privé (Admin uniquement)
 */
const getAllVehicles = async (req, res, next) => {
  try {
    const { status, validation_status, marque, dealership_id, search, page = 1, limit = 20 } = req.query;
    let list = [...memoryStore.vehicles];

    if (status && status !== 'all') {
      list = list.filter(v => String(v.status || '').toLowerCase() === status.toLowerCase());
    }
    if (validation_status && validation_status !== 'all') {
      list = list.filter(v => String(v.validation_status || v.status || '').toLowerCase() === validation_status.toLowerCase());
    }
    if (marque && marque !== 'all') {
      list = list.filter(v => v.marque && v.marque.toLowerCase() === marque.toLowerCase());
    }
    if (dealership_id) {
      list = list.filter(v => Number(v.dealership_id) === Number(dealership_id));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        (v.marque && v.marque.toLowerCase().includes(q)) ||
        (v.modele && v.modele.toLowerCase().includes(q)) ||
        (v.finition && v.finition.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    }

    // Enrichir avec concessionnaire et photos
    const total = list.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paginated = list.slice(offset, offset + Number(limit)).map(v => {
      const dealer = memoryStore.dealerships.find(d => Number(d.id) === Number(v.dealership_id));
      const images = memoryStore.vehicle_images ? memoryStore.vehicle_images.filter(img => Number(img.vehicle_id) === Number(v.id)) : [];
      return {
        ...v,
        dealership_nom: dealer ? dealer.nom : 'Vendeur Particulier',
        dealership_ville: dealer ? dealer.ville : v.ville || 'Kinshasa',
        dealership_telephone: dealer ? dealer.telephone : null,
        images_count: images.length,
        primary_image: images.find(img => img.is_principale)?.image_url || (images[0] ? images[0].image_url : null)
      };
    });

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      vehicles: paginated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/vehicles/:id
 * @desc    Obtenir le détail complet d'un véhicule
 * @access  Privé (Admin uniquement)
 */
const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = memoryStore.vehicles.find(v => Number(v.id) === Number(id));
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    const dealer = memoryStore.dealerships.find(d => Number(d.id) === Number(vehicle.dealership_id));
    const images = memoryStore.vehicle_images ? memoryStore.vehicle_images.filter(img => Number(img.vehicle_id) === Number(vehicle.id)) : [];

    res.json({
      success: true,
      vehicle: {
        ...vehicle,
        dealership: dealer || null,
        images
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/vehicles/:id/approve
 * @desc    Valider / Approuver une annonce de véhicule pour mise en ligne
 * @access  Privé (Admin uniquement)
 */
const approveVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = memoryStore.vehicles.find(v => Number(v.id) === Number(id));
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    vehicle.status = 'approved';
    vehicle.validation_status = 'approved';
    vehicle.approved_at = new Date();
    vehicle.approved_by = req.user.id;
    vehicle.rejection_reason = null;
    vehicle.updated_at = new Date();

    res.json({
      success: true,
      message: `L'annonce pour ${vehicle.marque} ${vehicle.modele} a été validée avec succès et est désormais visible du public.`,
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/vehicles/:id/reject
 * @desc    Rejeter une annonce avec indication du motif
 * @access  Privé (Admin uniquement)
 */
const rejectVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const vehicle = memoryStore.vehicles.find(v => Number(v.id) === Number(id));
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    const rejectionReason = reason || 'Annonce non conforme aux règles et critères de qualité CONGOCAR.';
    vehicle.status = 'rejected';
    vehicle.validation_status = 'rejected';
    vehicle.rejection_reason = rejectionReason;
    vehicle.rejected_at = new Date();
    vehicle.rejected_by = req.user.id;
    vehicle.updated_at = new Date();

    res.json({
      success: true,
      message: `L'annonce pour ${vehicle.marque} ${vehicle.modele} a été rejetée. Motif : "${rejectionReason}".`,
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/vehicles/:id
 * @desc    Modifier un véhicule en tant qu'administrateur
 * @access  Privé (Admin uniquement)
 */
const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.vehicles.findIndex(v => Number(v.id) === Number(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    const updated = {
      ...memoryStore.vehicles[idx],
      ...req.body,
      updated_at: new Date()
    };
    memoryStore.vehicles[idx] = updated;

    res.json({ success: true, message: 'Véhicule mis à jour avec succès.', vehicle: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/vehicles/:id
 * @desc    Supprimer un véhicule du parc
 * @access  Privé (Admin uniquement)
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.vehicles.findIndex(v => Number(v.id) === Number(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable.' });
    }

    memoryStore.vehicles.splice(idx, 1);
    // Supprimer les images associées
    if (memoryStore.vehicle_images) {
      memoryStore.vehicle_images = memoryStore.vehicle_images.filter(img => Number(img.vehicle_id) !== Number(id));
    }

    res.json({ success: true, message: 'Véhicule et données associées supprimés avec succès.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. GESTION DES CONCESSIONNAIRES (DEALERS)
// ==========================================
/**
 * @route   GET /api/admin/dealers
 * @desc    Lister l'ensemble des concessions avec compte, véhicules et statut
 * @access  Privé (Admin uniquement)
 */
const getAllDealers = async (req, res, next) => {
  try {
    const { search, ville, verified } = req.query;
    let list = [...memoryStore.dealerships];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.nom && d.nom.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q)) ||
        (d.telephone && d.telephone.toLowerCase().includes(q))
      );
    }
    if (ville && ville !== 'all') {
      list = list.filter(d => d.ville && d.ville.toLowerCase() === ville.toLowerCase());
    }
    if (verified !== undefined && verified !== null && verified !== '') {
      list = list.filter(d => Number(d.is_verified || d.verified || 0) === Number(verified));
    }

    // Enrichir avec le nombre de véhicules et l'abonnement
    const enriched = list.map(dealer => {
      const vehiclesCount = memoryStore.vehicles.filter(v => Number(v.dealership_id) === Number(dealer.id)).length;
      const sub = memoryStore.subscriptions.find(s => s.entity_type === 'dealership' && Number(s.dealership_id) === Number(dealer.id) && s.statut === 'actif');
      return {
        ...dealer,
        vehicles_count: vehiclesCount,
        active_plan: sub ? sub.plan_nom : 'Aucun abonnement actif',
        subscription_status: sub ? sub.statut : 'inactif'
      };
    });

    res.json({
      success: true,
      total: enriched.length,
      dealers: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/dealers/:id
 * @desc    Obtenir la fiche complète d'une concession
 * @access  Privé (Admin uniquement)
 */
const getDealerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dealer = memoryStore.dealerships.find(d => Number(d.id) === Number(id));
    if (!dealer) {
      return res.status(404).json({ success: false, message: 'Concessionnaire introuvable.' });
    }

    const vehicles = memoryStore.vehicles.filter(v => Number(v.dealership_id) === Number(dealer.id));
    const sub = memoryStore.subscriptions.find(s => s.entity_type === 'dealership' && Number(s.dealership_id) === Number(dealer.id));

    res.json({
      success: true,
      dealer: {
        ...dealer,
        vehicles,
        subscription: sub || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/dealers
 * @desc    Ajouter une nouvelle concession depuis le panneau admin
 * @access  Privé (Admin uniquement)
 */
const createDealer = async (req, res, next) => {
  try {
    const { nom, email, telephone, adresse, ville = 'Kinshasa', commune, is_verified = 1 } = req.body;
    if (!nom || !telephone) {
      return res.status(400).json({ success: false, message: 'Le nom de la concession et le téléphone sont obligatoires.' });
    }

    const newId = memoryStore.dealerships.length > 0 ? Math.max(...memoryStore.dealerships.map(d => Number(d.id))) + 1 : 1;
    const newDealer = {
      id: newId,
      user_id: req.body.user_id ? Number(req.body.user_id) : null,
      nom,
      slug: nom.toLowerCase().replace(/\s+/g, '-'),
      description: req.body.description || `Concessionnaire officiel ${nom}`,
      adresse: adresse || '',
      ville,
      commune: commune || 'Gombe',
      telephone,
      email: email || '',
      site_web: req.body.site_web || null,
      logo_url: req.body.logo_url || null,
      banniere_url: req.body.banniere_url || null,
      is_verified: is_verified ? 1 : 0,
      is_active: 1,
      rating: 5.0,
      total_reviews: 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryStore.dealerships.push(newDealer);

    res.status(201).json({ success: true, message: 'Concessionnaire créé avec succès.', dealer: newDealer });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/dealers/:id
 * @desc    Modifier les informations d'un concessionnaire
 * @access  Privé (Admin uniquement)
 */
const updateDealer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.dealerships.findIndex(d => Number(d.id) === Number(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Concessionnaire introuvable.' });
    }

    const updated = {
      ...memoryStore.dealerships[idx],
      ...req.body,
      updated_at: new Date()
    };
    memoryStore.dealerships[idx] = updated;

    res.json({ success: true, message: 'Concessionnaire mis à jour avec succès.', dealer: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/dealers/:id/verify
 * @desc    Basculer ou définir le statut certifié / vérifié d'une concession
 * @access  Privé (Admin uniquement)
 */
const toggleVerifyDealer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dealer = memoryStore.dealerships.find(d => Number(d.id) === Number(id));
    if (!dealer) {
      return res.status(404).json({ success: false, message: 'Concessionnaire introuvable.' });
    }

    const newStatus = req.body.verified !== undefined ? (req.body.verified ? 1 : 0) : (Number(dealer.is_verified) === 1 ? 0 : 1);
    dealer.is_verified = newStatus;
    dealer.verified = newStatus;
    dealer.updated_at = new Date();

    res.json({
      success: true,
      message: `Statut de certification pour "${dealer.nom}" mis à jour : ${newStatus === 1 ? 'Certifié CONGOCAR' : 'Non certifié'}.`,
      verified: newStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/dealers/:id
 * @desc    Supprimer une concession
 * @access  Privé (Admin uniquement)
 */
const deleteDealer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.dealerships.findIndex(d => Number(d.id) === Number(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Concessionnaire introuvable.' });
    }

    memoryStore.dealerships.splice(idx, 1);
    res.json({ success: true, message: 'Concessionnaire supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. GESTION DES GARAGES & SOS DÉPANNAGE
// ==========================================
/**
 * @route   GET /api/admin/garages
 * @desc    Lister tous les garages (validés, en attente, rejetés)
 * @access  Privé (Admin uniquement)
 */
const getAllGarages = async (req, res, next) => {
  try {
    const { search, statut_validation, commune, is_open_24h } = req.query;
    let list = [...memoryStore.garages];

    if (statut_validation && statut_validation !== 'all') {
      list = list.filter(g => String(g.statut_validation || 'valide').toLowerCase() === statut_validation.toLowerCase());
    }
    if (commune && commune !== 'all') {
      list = list.filter(g => g.commune && g.commune.toLowerCase() === commune.toLowerCase());
    }
    if (is_open_24h !== undefined && is_open_24h !== null && is_open_24h !== '') {
      list = list.filter(g => Number(g.is_open_24h || g.depannage_24h || 0) === Number(is_open_24h));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(g =>
        (g.nom && g.nom.toLowerCase().includes(q)) ||
        (g.commune && g.commune.toLowerCase().includes(q)) ||
        (g.specialites && String(g.specialites).toLowerCase().includes(q)) ||
        (g.telephone && g.telephone.toLowerCase().includes(q))
      );
    }

    // Enrichir avec les services
    const enriched = list.map(g => {
      const services = memoryStore.garage_services ? memoryStore.garage_services.filter(s => Number(s.garage_id) === Number(g.id)) : [];
      const images = memoryStore.garage_images ? memoryStore.garage_images.filter(img => Number(img.garage_id) === Number(g.id)) : [];
      return {
        ...g,
        services_count: services.length,
        images_count: images.length
      };
    });

    res.json({
      success: true,
      total: enriched.length,
      garages: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/garages/:id
 * @desc    Obtenir la fiche complète d'un atelier ou garage
 * @access  Privé (Admin uniquement)
 */
const getGarageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const garage = memoryStore.garages.find(g => Number(g.id) === Number(id));
    if (!garage) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const services = memoryStore.garage_services ? memoryStore.garage_services.filter(s => Number(s.garage_id) === Number(garage.id)) : [];
    const images = memoryStore.garage_images ? memoryStore.garage_images.filter(img => Number(img.garage_id) === Number(garage.id)) : [];

    res.json({
      success: true,
      garage: {
        ...garage,
        services,
        images
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/garages/:id/approve
 * @desc    Valider un atelier pour publication officielle et interventions SOS
 * @access  Privé (Admin uniquement)
 */
const approveGarage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const garage = memoryStore.garages.find(g => Number(g.id) === Number(id));
    if (!garage) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    garage.statut_validation = 'valide';
    garage.is_verified = 1;
    garage.verified = 1;
    garage.motif_rejet = null;
    garage.approved_at = new Date();
    garage.approved_by = req.user.id;
    garage.updated_at = new Date();

    res.json({
      success: true,
      message: `L'atelier "${garage.nom}" a été validé avec succès. Badge certifié activé.`,
      garage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/garages/:id/reject
 * @desc    Refuser ou suspendre un garage avec motif
 * @access  Privé (Admin uniquement)
 */
const rejectGarage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;

    const garage = memoryStore.garages.find(g => Number(g.id) === Number(id));
    if (!garage) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const motifRejet = motif || 'Dossier d’agrément non conforme ou coordonnées d\'urgence invalides.';
    garage.statut_validation = 'rejete';
    garage.is_verified = 0;
    garage.verified = 0;
    garage.motif_rejet = motifRejet;
    garage.rejected_at = new Date();
    garage.rejected_by = req.user.id;
    garage.updated_at = new Date();

    res.json({
      success: true,
      message: `L'agrément du garage "${garage.nom}" a été rejeté. Motif : "${motifRejet}".`,
      garage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/garages/:id
 * @desc    Mettre à jour les données d'un garage
 * @access  Privé (Admin uniquement)
 */
const updateGarage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.garages.findIndex(g => Number(g.id) === Number(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    const updated = {
      ...memoryStore.garages[idx],
      ...req.body,
      updated_at: new Date()
    };
    memoryStore.garages[idx] = updated;

    res.json({ success: true, message: 'Fiche garage mise à jour avec succès.', garage: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/garages/:id
 * @desc    Supprimer un garage
 * @access  Privé (Admin uniquement)
 */
const deleteGarage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.garages.findIndex(g => Number(g.id) === Number(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Garage introuvable.' });
    }

    memoryStore.garages.splice(idx, 1);
    res.json({ success: true, message: 'Garage supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. GESTION DES MARQUES (BRANDS)
// ==========================================
/**
 * @route   GET /api/admin/marques (ou /api/admin/brands)
 * @desc    Lister toutes les marques automobiles enregistrées
 * @access  Privé (Admin uniquement)
 */
const getAllBrands = async (req, res, next) => {
  try {
    const brands = adminStorage.getBrands(memoryStore, req.query);
    res.json({ success: true, total: brands.length, marques: brands, brands });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/marques/:id
 * @desc    Détail d'une marque avec ses modèles
 * @access  Privé (Admin uniquement)
 */
const getBrandById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = adminStorage.getBrandById(memoryStore, id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Marque introuvable.' });
    }
    const models = adminStorage.getModels(memoryStore, { marque_id: id });
    res.json({ success: true, marque: { ...brand, models }, brand: { ...brand, models } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/marques
 * @desc    Ajouter une nouvelle marque automobile
 * @access  Privé (Admin uniquement)
 */
const createBrand = async (req, res, next) => {
  try {
    const { nom, pays, logo_url, is_popular } = req.body;
    if (!nom) {
      return res.status(400).json({ success: false, message: 'Le nom de la marque est obligatoire.' });
    }
    const brand = adminStorage.createBrand(memoryStore, { nom, pays, logo_url, is_popular });
    res.status(201).json({ success: true, message: `Marque "${brand.nom}" ajoutée avec succès.`, marque: brand, brand });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/marques/:id
 * @desc    Mettre à jour une marque automobile
 * @access  Privé (Admin uniquement)
 */
const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = adminStorage.updateBrand(memoryStore, id, req.body);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Marque introuvable.' });
    }
    res.json({ success: true, message: 'Marque mise à jour avec succès.', marque: brand, brand });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/marques/:id
 * @desc    Supprimer une marque automobile
 * @access  Privé (Admin uniquement)
 */
const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = adminStorage.deleteBrand(memoryStore, id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Marque introuvable.' });
    }
    res.json({ success: true, message: 'Marque supprimée avec succès.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. GESTION DES MODÈLES (MODELS)
// ==========================================
/**
 * @route   GET /api/admin/modeles (ou /api/admin/models)
 * @desc    Lister tous les modèles de véhicules
 * @access  Privé (Admin uniquement)
 */
const getAllModels = async (req, res, next) => {
  try {
    const models = adminStorage.getModels(memoryStore, req.query);
    res.json({ success: true, total: models.length, modeles: models, models });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/modeles/:id
 * @desc    Obtenir le détail d'un modèle
 * @access  Privé (Admin uniquement)
 */
const getModelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const model = adminStorage.getModelById(memoryStore, id);
    if (!model) {
      return res.status(404).json({ success: false, message: 'Modèle introuvable.' });
    }
    res.json({ success: true, modele: model, model });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/modeles
 * @desc    Ajouter un nouveau modèle sous une marque
 * @access  Privé (Admin uniquement)
 */
const createModel = async (req, res, next) => {
  try {
    const { marque_id, nom, categorie, annee_debut, annee_fin, is_popular } = req.body;
    if (!marque_id || !nom) {
      return res.status(400).json({ success: false, message: 'La marque (marque_id) et le nom du modèle sont obligatoires.' });
    }
    const model = adminStorage.createModel(memoryStore, { marque_id, nom, categorie, annee_debut, annee_fin, is_popular });
    res.status(201).json({ success: true, message: `Modèle "${model.nom}" ajouté avec succès.`, modele: model, model });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/modeles/:id
 * @desc    Mettre à jour un modèle de véhicule
 * @access  Privé (Admin uniquement)
 */
const updateModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const model = adminStorage.updateModel(memoryStore, id, req.body);
    if (!model) {
      return res.status(404).json({ success: false, message: 'Modèle introuvable.' });
    }
    res.json({ success: true, message: 'Modèle mis à jour avec succès.', modele: model, model });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/modeles/:id
 * @desc    Supprimer un modèle
 * @access  Privé (Admin uniquement)
 */
const deleteModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = adminStorage.deleteModel(memoryStore, id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Modèle introuvable.' });
    }
    res.json({ success: true, message: 'Modèle supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. GESTION DES SIGNALEMENTS (REPORTS)
// ==========================================
/**
 * @route   GET /api/admin/reports (ou /api/admin/signalements)
 * @desc    Lister l'ensemble des signalements (véhicules suspects, faux profils, etc.)
 * @access  Privé (Admin uniquement)
 */
const getAllReports = async (req, res, next) => {
  try {
    const reports = adminStorage.getReports(memoryStore, req.query);
    res.json({ success: true, total: reports.length, reports, signalements: reports });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/reports/:id
 * @desc    Détail d'un signalement
 * @access  Privé (Admin uniquement)
 */
const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = adminStorage.getReportById(memoryStore, id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Signalement introuvable.' });
    }
    res.json({ success: true, report, signalement: report });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/reports
 * @desc    Créer ou enregistrer un signalement
 * @access  Privé (Admin uniquement)
 */
const createReport = async (req, res, next) => {
  try {
    const { target_type, target_id, target_title, reason, description, reporter_name, reporter_email, reporter_phone } = req.body;
    if (!target_type || !target_id) {
      return res.status(400).json({ success: false, message: 'target_type et target_id sont requis.' });
    }
    const report = adminStorage.createReport(memoryStore, {
      target_type,
      target_id,
      target_title,
      reason,
      description,
      reporter_name,
      reporter_email,
      reporter_phone
    });
    res.status(201).json({ success: true, message: 'Signalement enregistré.', report });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/reports/:id/status (ou /resolve)
 * @desc    Traiter, clôturer ou rejeter un signalement
 * @access  Privé (Admin uniquement)
 */
const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatus = ['en_attente', 'traite', 'rejete', 'archive'];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: `Statut invalide. Autorisés : ${validStatus.join(', ')}.` });
    }

    const report = adminStorage.updateReportStatus(memoryStore, id, {
      status,
      admin_notes,
      treated_by: req.user.id
    });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Signalement introuvable.' });
    }

    res.json({
      success: true,
      message: `Signalement #${id} mis à jour : statut "${report.status}".`,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/reports/:id
 * @desc    Supprimer un signalement
 * @access  Privé (Admin uniquement)
 */
const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = adminStorage.deleteReport(memoryStore, id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Signalement introuvable.' });
    }
    res.json({ success: true, message: 'Signalement supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 9. GESTION DES ABONNEMENTS (SUBSCRIPTIONS & PLANS)
// ==========================================
/**
 * @route   GET /api/admin/subscriptions (ou /api/admin/abonnements)
 * @desc    Lister l'ensemble des abonnements professionnels
 * @access  Privé (Admin uniquement)
 */
const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = adminStorage.getSubscriptions(memoryStore, req.query);
    const plans = adminStorage.getPlans(memoryStore);
    res.json({
      success: true,
      total: subscriptions.length,
      subscriptions,
      abonnements: subscriptions,
      plans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/subscriptions/plans (ou /api/admin/plans)
 * @desc    Lister les formules et grilles tarifaires officielles CONGOCAR
 * @access  Privé (Admin uniquement)
 */
const getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = adminStorage.getPlans(memoryStore);
    res.json({ success: true, plans });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/subscriptions
 * @desc    Attribuer ou créer un abonnement professionnel
 * @access  Privé (Admin uniquement)
 */
const createSubscription = async (req, res, next) => {
  try {
    const { entity_type, dealership_id, garage_id, plan_id, date_fin, statut } = req.body;
    if (!entity_type || !plan_id) {
      return res.status(400).json({ success: false, message: 'entity_type et plan_id sont requis.' });
    }

    let entity_nom = req.body.entity_nom;
    if (!entity_nom) {
      if (dealership_id) {
        const d = memoryStore.dealerships.find(dealer => Number(dealer.id) === Number(dealership_id));
        if (d) entity_nom = d.nom;
      } else if (garage_id) {
        const g = memoryStore.garages.find(garage => Number(garage.id) === Number(garage_id));
        if (g) entity_nom = g.nom;
      }
    }

    const sub = adminStorage.createSubscription(memoryStore, {
      ...req.body,
      entity_nom
    });

    res.status(201).json({ success: true, message: 'Abonnement créé et activé.', subscription: sub });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/subscriptions/:id
 * @desc    Modifier un abonnement (statut, prolongation date, changement de plan)
 * @access  Privé (Admin uniquement)
 */
const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sub = adminStorage.updateSubscription(memoryStore, id, req.body);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Abonnement introuvable.' });
    }
    res.json({ success: true, message: 'Abonnement mis à jour avec succès.', subscription: sub });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/subscriptions/:id
 * @desc    Résilier ou supprimer un abonnement
 * @access  Privé (Admin uniquement)
 */
const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = adminStorage.deleteSubscription(memoryStore, id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Abonnement introuvable.' });
    }
    res.json({ success: true, message: 'Abonnement supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 10. GESTION DES PAIEMENTS & TRANSACTIONS
// ==========================================
/**
 * @route   GET /api/admin/payments (ou /api/admin/paiements)
 * @desc    Lister toutes les transactions et règlements (Mobile Money, Carte, Virement)
 * @access  Privé (Admin uniquement)
 */
const getAllPayments = async (req, res, next) => {
  try {
    const payments = adminStorage.getPayments(memoryStore, req.query);
    const totalVolumeUsd = payments
      .filter(p => p.statut === 'reussi')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    res.json({
      success: true,
      total: payments.length,
      totalVolumeUsd,
      payments,
      paiements: payments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/payments/:id
 * @desc    Détail d'une transaction
 * @access  Privé (Admin uniquement)
 */
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = adminStorage.getPaymentById(memoryStore, id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Transaction introuvable.' });
    }
    res.json({ success: true, payment, paiement: payment });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/payments
 * @desc    Enregistrer manuellement un règlement (Mobile Money direct, chèque, virement)
 * @access  Privé (Admin uniquement)
 */
const createPayment = async (req, res, next) => {
  try {
    const { amount, payment_method, purpose, entity_nom, client_nom, reference, statut } = req.body;
    if (!amount || !payment_method) {
      return res.status(400).json({ success: false, message: 'Le montant et le moyen de paiement sont obligatoires.' });
    }

    const payment = adminStorage.createPayment(memoryStore, req.body);
    res.status(201).json({ success: true, message: 'Paiement enregistré avec succès.', payment });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/payments/:id/status
 * @desc    Mettre à jour le statut d'une transaction (valider, rembourser, annuler)
 * @access  Privé (Admin uniquement)
 */
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut, notes } = req.body;

    const validStatus = ['reussi', 'en_attente', 'echoue', 'rembourse', 'annule'];
    if (statut && !validStatus.includes(statut)) {
      return res.status(400).json({ success: false, message: `Statut invalide. Autorisés : ${validStatus.join(', ')}.` });
    }

    const payment = adminStorage.updatePaymentStatus(memoryStore, id, { statut, notes });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Transaction introuvable.' });
    }

    res.json({
      success: true,
      message: `Transaction ${payment.transaction_id} actualisée : statut "${payment.statut}".`,
      payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Stats
  getStats,
  // Utilisateurs
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  // Véhicules & modération
  getAllVehicles,
  getVehicleById,
  approveVehicle,
  rejectVehicle,
  updateVehicle,
  deleteVehicle,
  // Concessionnaires
  getAllDealers,
  getDealerById,
  createDealer,
  updateDealer,
  toggleVerifyDealer,
  deleteDealer,
  // Garages
  getAllGarages,
  getGarageById,
  approveGarage,
  rejectGarage,
  updateGarage,
  deleteGarage,
  // Marques
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  // Modèles
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  // Signalements
  getAllReports,
  getReportById,
  createReport,
  updateReportStatus,
  deleteReport,
  // Abonnements & Formules
  getAllSubscriptions,
  getSubscriptionPlans,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  // Paiements & Transactions
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus
};
