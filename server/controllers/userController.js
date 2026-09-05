const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

/**
 * @route   GET /api/users/profile
 * @desc    Profil de l'utilisateur connecté
 * @access  Privé
 */
const getProfile = async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, name, email, role, phone, avatar, created_at, updated_at 
       FROM users 
       WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    const user = rows[0];

    // Si c'est une agence ou un agent, joindre les infos d'agence/agent
    let additionalInfo = null;
    if (user.role === 'agency') {
      const agencies = await query('SELECT * FROM agencies WHERE user_id = ? LIMIT 1', [user.id]);
      additionalInfo = agencies[0] || null;
    } else if (user.role === 'agent') {
      const agents = await query('SELECT * FROM agents WHERE user_id = ? LIMIT 1', [user.id]);
      additionalInfo = agents[0] || null;
    }

    res.json({
      success: true,
      user,
      profileDetails: additionalInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Mettre à jour les informations du profil utilisateur
 * @access  Privé
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    await query(
      `UPDATE users 
       SET name = COALESCE(?, name), 
           phone = COALESCE(?, phone), 
           avatar = COALESCE(?, avatar),
           updated_at = NOW()
       WHERE id = ?`,
      [name, phone, avatar, req.user.id]
    );

    // Mettre à jour aussi la table agent ou agence si applicable
    if (req.user.role === 'agent') {
      await query(
        `UPDATE agents SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar), updated_at = NOW() WHERE user_id = ?`,
        [name, phone, avatar, req.user.id]
      );
    } else if (req.user.role === 'agency') {
      await query(
        `UPDATE agencies SET name = COALESCE(?, name), phone = COALESCE(?, phone), logo = COALESCE(?, logo), updated_at = NOW() WHERE user_id = ?`,
        [name, phone, avatar, req.user.id]
      );
    }

    const updated = await query('SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès.',
      user: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/change-password
 * @desc    Changer le mot de passe utilisateur
 * @access  Privé
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir l\'ancien et le nouveau mot de passe.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit comporter au moins 6 caractères.'
      });
    }

    const rows = await query('SELECT password FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
