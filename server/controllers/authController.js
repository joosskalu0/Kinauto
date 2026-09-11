const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');

/**
 * Durée de validité et secret du JWT
 */
const getJwtSecret = () => process.env.JWT_SECRET || 'congocar_secret_jwt_key_kinshasa_2026';
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

/**
 * Rôles officiels définis pour CONGOCAR
 */
const VALID_ROLES = ['admin', 'dealer', 'seller', 'garage', 'user'];

/**
 * Helper de génération de token JWT
 * Contient id, email, name, role
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );
};

/**
 * Normalise un rôle vers un des rôles CONGOCAR officiels
 */
const normalizeRole = (role) => {
  if (!role) return 'user';
  const r = String(role).toLowerCase().trim();
  if (r === 'client') return 'user';
  if (r === 'salesperson' || r === 'dealer_sales') return 'seller';
  if (r === 'superadmin') return 'admin';
  if (VALID_ROLES.includes(r)) return r;
  return 'user';
};

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur avec mot de passe hashé par bcrypt
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'user', 
      phone = null, 
      city = 'Kinshasa', 
      dealershipName, 
      garageName, 
      commune 
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner votre nom, adresse e-mail et mot de passe.'
      });
    }

    // Validation du format e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'adresse e-mail invalide.'
      });
    }

    // Validation de la sécurité du mot de passe (minimum 6 caractères)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit comporter au moins 6 caractères.'
      });
    }

    const safeRole = normalizeRole(role);

    // Vérifier si l'adresse e-mail existe déjà
    const existingUsers = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse e-mail est déjà associée à un compte existant.'
      });
    }

    // Hashage sécurisé du mot de passe avec bcrypt (Ne jamais stocker en clair !)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertion en base de données MySQL
    const result = await query(
      `INSERT INTO users (name, email, password, role, phone, city, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [name.trim(), cleanEmail, hashedPassword, safeRole, phone ? phone.trim() : null, city]
    );

    const newUserId = result.insertId;

    // Création automatique de la fiche entité selon le rôle
    let entityData = null;
    if (safeRole === 'dealer' || safeRole === 'seller') {
      const dName = dealershipName || `${name.trim()} Concession`;
      const dealRes = await query(
        `INSERT INTO dealerships (user_id, nom, telephone, email, statut_abonnement, plan_id, verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'essai_gratuit', 'starter', 1, NOW(), NOW())`,
        [newUserId, dName, phone, cleanEmail]
      );
      entityData = { id: dealRes.insertId, name: dName, type: 'dealership' };
    } else if (safeRole === 'garage') {
      const gName = garageName || `Atelier Mécanique ${name.trim()}`;
      const garRes = await query(
        `INSERT INTO garages (user_id, nom, commune, telephone, email, is_open_24h, verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 0, 1, NOW(), NOW())`,
        [newUserId, gName, commune || city || 'Kinshasa', phone, cleanEmail]
      );
      entityData = { id: garRes.insertId, name: gName, type: 'garage' };
    }

    const userPayload = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role: safeRole,
      phone: phone ? phone.trim() : null,
      city,
      entity: entityData
    };

    const token = generateToken(userPayload);

    return res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Votre compte a été créé avec succès.',
      data: {
        user: userPayload,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur (vérification bcrypt + délivrance JWT)
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez saisir votre adresse e-mail et votre mot de passe.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [cleanEmail]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides : adresse e-mail ou mot de passe incorrect.'
      });
    }

    const user = users[0];

    // Vérification du mot de passe avec bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides : adresse e-mail ou mot de passe incorrect.'
      });
    }

    // Récupérer les entités associées selon le rôle
    let dealership = null;
    let garage = null;

    if (user.role === 'dealer' || user.role === 'seller') {
      const deals = await query('SELECT * FROM dealerships WHERE user_id = ? LIMIT 1', [user.id]);
      if (deals.length > 0) dealership = deals[0];
    } else if (user.role === 'garage') {
      const gars = await query('SELECT * FROM garages WHERE user_id = ? LIMIT 1', [user.id]);
      if (gars.length > 0) garage = gars[0];
    }

    // Mettre à jour la date de dernière connexion
    try {
      await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    } catch (_) {}

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: normalizeRole(user.role)
    });

    return res.json({
      success: true,
      message: `Bienvenue ${user.name} ! Connexion réussie.`,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: normalizeRole(user.role),
          phone: user.phone,
          city: user.city || 'Kinshasa',
          avatar: user.avatar,
          dealership,
          garage
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion d'un utilisateur (invalidation de session côté client)
 * @access  Public
 */
const logout = async (req, res) => {
  return res.json({
    success: true,
    message: 'Déconnexion effectuée avec succès. Votre session a été clôturée.'
  });
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Demande de réinitialisation de mot de passe (génère un code & token)
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner votre adresse e-mail.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = await query('SELECT id, name, email FROM users WHERE email = ? LIMIT 1', [cleanEmail]);

    if (users.length === 0) {
      // Pour des raisons de sécurité, on peut répondre avec un message générique
      return res.status(404).json({
        success: false,
        message: 'Aucun compte trouvé avec cette adresse e-mail.'
      });
    }

    // Génération d'un code à 6 chiffres et d'un token aléatoire
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 heure

    // Enregistrement dans la table password_resets
    await query(
      `INSERT INTO password_resets (email, token, code, expires_at, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [cleanEmail, resetToken, resetCode, expiresAt]
    );

    return res.json({
      success: true,
      message: `Code de réinitialisation généré pour ${cleanEmail}.`,
      data: {
        email: cleanEmail,
        resetCode,
        resetToken,
        expiresIn: '1 heure'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Réinitialisation du mot de passe avec code ou token + nouveau mot de passe hashé
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, token, newPassword } = req.body;

    if (!email || (!code && !token) || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner l\'e-mail, le code ou le jeton de sécurité, ainsi que le nouveau mot de passe.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit comporter au moins 6 caractères.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const verificationKey = String(code || token).trim();

    // Vérifier le code / token dans password_resets
    const resets = await query(
      `SELECT * FROM password_resets 
       WHERE email = ? AND (code = ? OR token = ?) AND expires_at > NOW() 
       LIMIT 1`,
      [cleanEmail, verificationKey, verificationKey]
    );

    if (resets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Code de réinitialisation invalide ou expiré.'
      });
    }

    // Hasher le nouveau mot de passe avec bcrypt (Sécurité absolue)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe dans MySQL
    await query(
      `UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?`,
      [hashedPassword, cleanEmail]
    );

    // Nettoyer les tokens utilisés
    await query(`DELETE FROM password_resets WHERE email = ?`, [cleanEmail]);

    return res.json({
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez à présent vous connecter.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir le profil complet de l'utilisateur connecté via JWT
 * @access  Privé (authenticateJWT)
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const users = await query(
      'SELECT id, name, email, role, phone, city, avatar, status, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable.'
      });
    }

    const user = users[0];
    user.role = normalizeRole(user.role);

    let dealership = null;
    let garage = null;

    if (user.role === 'dealer' || user.role === 'seller') {
      const deals = await query('SELECT * FROM dealerships WHERE user_id = ? LIMIT 1', [user.id]);
      if (deals.length > 0) dealership = deals[0];
    } else if (user.role === 'garage') {
      const gars = await query('SELECT * FROM garages WHERE user_id = ? LIMIT 1', [user.id]);
      if (gars.length > 0) garage = gars[0];
    }

    return res.json({
      success: true,
      data: {
        ...user,
        dealership,
        garage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Modification des informations personnelles et changement de mot de passe
 * @access  Privé (authenticateJWT)
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, city, avatar, currentPassword, newPassword } = req.body;

    // Si l'utilisateur souhaite changer son mot de passe
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Veuillez saisir votre mot de passe actuel pour définir un nouveau mot de passe.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit comporter au moins 6 caractères.'
        });
      }

      const users = await query('SELECT password FROM users WHERE id = ? LIMIT 1', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
      }

      const isCurrentMatch = await bcrypt.compare(currentPassword, users[0].password);
      if (!isCurrentMatch) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe actuel renseigné est incorrect.'
        });
      }

      // Hash du nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedNew = await bcrypt.hash(newPassword, salt);
      await query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedNew, userId]);
    }

    // Mise à jour des coordonnées
    if (name || phone || city || avatar) {
      await query(
        `UPDATE users 
         SET name = COALESCE(?, name), 
             phone = COALESCE(?, phone), 
             city = COALESCE(?, city), 
             avatar = COALESCE(?, avatar), 
             updated_at = NOW() 
         WHERE id = ?`,
        [name ? name.trim() : null, phone ? phone.trim() : null, city, avatar, userId]
      );
    }

    const updated = await query(
      'SELECT id, name, email, role, phone, city, avatar, updated_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    const safeUser = updated[0];
    safeUser.role = normalizeRole(safeUser.role);

    return res.json({
      success: true,
      message: 'Profil mis à jour avec succès.',
      data: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/users
 * @desc    Gestion des rôles : Obtenir la liste des utilisateurs
 * @access  Privé (Admin uniquement)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await query(
      `SELECT id, name, email, role, phone, city, status, created_at, last_login_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    const mapped = users.map(u => ({
      ...u,
      role: normalizeRole(u.role)
    }));

    return res.json({
      success: true,
      total: mapped.length,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/users/:id/role
 * @desc    Gestion des rôles : Modifier le rôle d'un utilisateur (admin, dealer, seller, garage, user)
 * @access  Privé (Admin uniquement)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez spécifier le nouveau rôle.'
      });
    }

    const safeRole = normalizeRole(role);
    if (!VALID_ROLES.includes(safeRole)) {
      return res.status(400).json({
        success: false,
        message: `Rôle non valide. Rôles autorisés : ${VALID_ROLES.join(', ')}`
      });
    }

    await query('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?', [safeRole, targetUserId]);

    const updated = await query(
      'SELECT id, name, email, role, phone, city, status FROM users WHERE id = ? LIMIT 1',
      [targetUserId]
    );

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    return res.json({
      success: true,
      message: `Rôle mis à jour avec succès en [${safeRole}].`,
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  getUsers,
  updateUserRole,
  VALID_ROLES
};
