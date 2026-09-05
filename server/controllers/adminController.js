const { query } = require('../config/database');

/**
 * @route   GET /api/admin/stats
 * @desc    Statistiques globales du tableau de bord d'administration concessionnaires
 * @access  Privé (Admin uniquement)
 */
const getStats = async (req, res, next) => {
  try {
    const [usersCount] = await query('SELECT COUNT(*) as count FROM users');
    const [vehiclesCount] = await query('SELECT COUNT(*) as count FROM vehicles');
    const [availableVehicles] = await query('SELECT COUNT(*) as count FROM vehicles WHERE status = "disponible"');
    const [dealershipsCount] = await query('SELECT COUNT(*) as count FROM dealerships');
    const [leadsCount] = await query('SELECT COUNT(*) as count FROM leads');
    
    let garagesCount = [{ count: 0 }];
    let breakdownCount = [{ count: 0 }];
    try {
      garagesCount = await query('SELECT COUNT(*) as count FROM garages');
      breakdownCount = await query('SELECT COUNT(*) as count FROM breakdown_requests');
    } catch {
      // Tables optionnelles
    }

    // Répartition des véhicules par marque
    const marqueStats = await query(`
      SELECT marque, COUNT(*) as count 
      FROM vehicles 
      GROUP BY marque 
      ORDER BY count DESC 
      LIMIT 8
    `);

    // Répartition par type de carburant
    const carburantStats = await query(`
      SELECT carburant, COUNT(*) as count 
      FROM vehicles 
      GROUP BY carburant 
      ORDER BY count DESC
    `);

    // Derniers leads reçus
    const recentLeads = await query(`
      SELECT l.id, l.vehicle_title, l.nom_client, l.telephone, l.type_demande, l.statut, l.created_at,
             d.nom as dealership_nom
      FROM leads l
      LEFT JOIN dealerships d ON l.dealership_id = d.id
      ORDER BY l.created_at DESC
      LIMIT 5
    `);

    // Dernières inscriptions
    const latestUsers = await query(`
      SELECT id, name, email, role, phone, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalUsers: usersCount.count || 0,
        totalVehicles: vehiclesCount.count || 0,
        availableVehicles: availableVehicles.count || 0,
        totalDealerships: dealershipsCount.count || 0,
        totalLeads: leadsCount.count || 0,
        totalGarages: garagesCount[0]?.count || 0,
        totalBreakdownRequests: breakdownCount[0]?.count || 0,
        marqueStats,
        carburantStats,
        recentLeads,
        latestUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Lister tous les utilisateurs de la plateforme
 * @access  Privé (Admin uniquement)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClauses = ['1=1'];
    let params = [];

    if (role) {
      whereClauses.push('role = ?');
      params.push(role);
    }

    if (search) {
      whereClauses.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const whereSql = whereClauses.join(' AND ');

    const users = await query(`
      SELECT id, name, email, role, phone, avatar, created_at, updated_at 
      FROM users 
      WHERE ${whereSql}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), Number(offset)]);

    const [{ total }] = await query(`SELECT COUNT(*) as total FROM users WHERE ${whereSql}`, params);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      users
    });
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

    const validRoles = ['user', 'dealer', 'salesperson', 'garage', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide.' });
    }

    await query('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?', [role, id]);

    res.json({
      success: true,
      message: `Rôle mis à jour avec succès : ${role}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer un utilisateur et ses données
 * @access  Privé (Admin uniquement)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Impossible de supprimer votre propre compte admin.' });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser
};
