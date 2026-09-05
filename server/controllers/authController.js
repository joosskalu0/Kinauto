const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Génère un JSON Web Token pour l'utilisateur
 */
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'autoconcession_default_secret_key_jwt_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    secret,
    { expiresIn }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur (user, dealer, salesperson ou garage)
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user', phone = null, dealershipName, garageName, commune } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir le nom, l\'adresse e-mail et le mot de passe.'
      });
    }

    // Valider le format de l'e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'adresse e-mail invalide.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit comporter au moins 6 caractères.'
      });
    }

    // Rôles autorisés pour l'auto-inscription (dealer = concessionnaire, garage = atelier, user = acheteur)
    const allowedRoles = ['user', 'dealer', 'salesperson', 'garage'];
    const safeRole = allowedRoles.includes(role) ? role : 'user';

    // Vérifier si l'e-mail existe déjà
    const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse e-mail est déjà associée à un compte.'
      });
    }

    // Hasher le mot de passe avec bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insérer l'utilisateur
    const result = await query(
      `INSERT INTO users (name, email, password, role, phone, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword, safeRole, phone]
    );

    const newUserId = result.insertId;

    // Si concessionnaire, créer la fiche concession
    if (safeRole === 'dealer') {
      await query(
        `INSERT INTO dealerships (user_id, nom, telephone, email, statut_abonnement, plan_id, verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'essai_gratuit', 'starter', 1, NOW(), NOW())`,
        [newUserId, dealershipName || name.trim(), phone, email.toLowerCase().trim()]
      );
    } else if (safeRole === 'garage') {
      await query(
        `INSERT INTO garages (user_id, nom, commune, telephone, email, is_open_24h, verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 0, 1, NOW(), NOW())`,
        [newUserId, garageName || name.trim(), commune || 'Kinshasa', phone, email.toLowerCase().trim()]
      );
    }

    const token = generateToken({
      id: newUserId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: safeRole
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès.',
      data: {
        user: {
          id: newUserId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role: safeRole,
          phone: phone
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur (génère un JWT)
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

    const users = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides (e-mail ou mot de passe incorrect).'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides (e-mail ou mot de passe incorrect).'
      });
    }

    let dealership = null;
    let garage = null;

    if (user.role === 'dealer' || user.role === 'salesperson') {
      const deals = await query('SELECT * FROM dealerships WHERE user_id = ? LIMIT 1', [user.id]);
      if (deals.length > 0) dealership = deals[0];
    } else if (user.role === 'garage') {
      const gars = await query('SELECT * FROM garages WHERE user_id = ? LIMIT 1', [user.id]);
      if (gars.length > 0) garage = gars[0];
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Connexion réussie.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
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
 * @route   GET /api/auth/me
 * @desc    Obtenir le profil de l'utilisateur connecté via son JWT
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const users = await query(
      'SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable.'
      });
    }

    const user = users[0];
    let dealership = null;
    let garage = null;

    if (user.role === 'dealer' || user.role === 'salesperson') {
      const deals = await query('SELECT * FROM dealerships WHERE user_id = ? LIMIT 1', [user.id]);
      if (deals.length > 0) dealership = deals[0];
    } else if (user.role === 'garage') {
      const gars = await query('SELECT * FROM garages WHERE user_id = ? LIMIT 1', [user.id]);
      if (gars.length > 0) garage = gars[0];
    }

    res.json({
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
 * @desc    Mettre à jour ses propres informations de profil
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, password } = req.body;
    const userId = req.user.id;

    let updateQuery = 'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar)';
    let params = [name, phone, avatar];

    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ', updated_at = NOW() WHERE id = ?';
    params.push(userId);

    await query(updateQuery, params);

    const updated = await query(
      'SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
