const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const notificationTriggers = require('../services/notificationTriggers');
const { getJwtSecret } = require('../middleware/authMiddleware');

const BCRYPT_ROUNDS = 10;

function signToken(userRow) {
  return jwt.sign(
    {
      sub: userRow.id,
      email: userRow.email,
      role: userRow.role,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    await userService.ensureUsersTable();
    const {
      name,
      email,
      password,
      role,
      allergies,
      dietaryPreference,
      preferredLanguage,
    } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required (min 6 characters)',
      });
    }
    if (!role || !userService.isValidRole(role)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing role' });
    }
    if (!userService.isPublicRegistrationRole(role)) {
      return res.status(403).json({
        success: false,
        message: 'This role requires platform approval and cannot be self-registered.',
      });
    }

    const existing = await userService.findUserByEmail(String(email).trim());
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
    const isConsumer = role === 'consumer';
    await userService.createUser({
      name: String(name).trim(),
      email: String(email).trim(),
      passwordHash,
      role,
      allergies:
        isConsumer && allergies != null && String(allergies).trim() !== ''
          ? String(allergies).trim()
          : null,
      dietaryPreference:
        isConsumer && dietaryPreference != null && String(dietaryPreference).trim() !== ''
          ? String(dietaryPreference).trim()
          : null,
      preferredLanguage: preferredLanguage != null ? String(preferredLanguage) : 'en',
    });

    void notificationTriggers
      .onUserRegistered(String(name).trim(), String(email).trim(), role)
      .catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Account created. Please sign in.',
    });
  } catch (e) {
    console.error('register error', e);
    if (e.message && e.message.includes('JWT_SECRET')) {
      return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    await userService.ensureUsersTable();
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const row = await userService.findUserByEmail(String(email).trim());
    if (!row) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(String(password), row.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const publicRow = await userService.findUserById(row.id);
    const user = userService.rowToPublicUser(publicRow);
    const token = signToken(row);

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (e) {
    console.error('login error', e);
    if (e.message && e.message.includes('JWT_SECRET')) {
      return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

exports.me = async (req, res) => {
  try {
    await userService.ensureUsersTable();
    const id = req.user.id;
    const row = await userService.findUserById(id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      user: userService.rowToPublicUser(row),
    });
  } catch (e) {
    console.error('me error', e);
    return res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    await userService.ensureUsersTable();
    const id = req.user.id;
    const current = await userService.findUserById(id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      allergies,
      dietaryPreference,
      preferredLanguage,
      themePreference,
      companyName,
      companyDescription,
      companyWebsite,
      companyLogoUrl,
      companyLocation,
    } = req.body || {};
    const nextName = name != null ? String(name).trim() : current.name;
    if (!nextName) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const nextTheme =
      themePreference === 'light' || themePreference === 'dark' ? themePreference : undefined;

    const isConsumer = current.role === 'consumer';
    const isSupplyChain = userService.SUPPLY_CHAIN_ROLES.includes(current.role);
    const updated = await userService.updateUserProfile(id, {
      name: nextName,
      role: current.role,
      allergies: isConsumer
        ? allergies != null
          ? String(allergies).trim() || null
          : null
        : null,
      dietaryPreference: isConsumer
        ? dietaryPreference != null
          ? String(dietaryPreference).trim() || null
          : null
        : null,
      preferredLanguage:
        preferredLanguage != null ? String(preferredLanguage).trim() || 'en' : current.preferred_language,
      themePreference: nextTheme,
      companyName: isSupplyChain && companyName != null ? String(companyName).trim() || null : undefined,
      companyDescription:
        isSupplyChain && companyDescription != null
          ? String(companyDescription).trim() || null
          : undefined,
      companyWebsite:
        isSupplyChain && companyWebsite != null ? String(companyWebsite).trim() || null : undefined,
      companyLogoUrl:
        isSupplyChain && companyLogoUrl != null ? String(companyLogoUrl).trim() || null : undefined,
      companyLocation:
        isSupplyChain && companyLocation != null ? String(companyLocation).trim() || null : undefined,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: userService.rowToPublicUser(updated),
      message: 'Profile updated successfully',
    });
  } catch (e) {
    console.error('update me error', e);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
