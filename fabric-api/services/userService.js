const pool = require('../config/db');

const ROLES = ['admin', 'manufacturer', 'distributor', 'retailer', 'consumer'];

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','manufacturer','distributor','retailer','consumer')),
      allergies TEXT,
      dietary_preference TEXT,
      preferred_language TEXT DEFAULT 'en',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function rowToPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    allergies: row.allergies ?? null,
    dietaryPreference: row.dietary_preference ?? null,
    preferredLanguage: row.preferred_language ?? 'en',
  };
}

async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [
    email,
  ]);
  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await pool.query('SELECT id, name, email, role, allergies, dietary_preference, preferred_language, created_at FROM users WHERE id = $1', [
    id,
  ]);
  return result.rows[0] || null;
}

async function createUser({ name, email, passwordHash, role, allergies, dietaryPreference, preferredLanguage }) {
  const lang = preferredLanguage && String(preferredLanguage).trim() !== '' ? preferredLanguage : 'en';
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, allergies, dietary_preference, preferred_language)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role, allergies, dietary_preference, preferred_language`,
    [
      name,
      email,
      passwordHash,
      role,
      allergies ?? null,
      dietaryPreference ?? null,
      lang,
    ]
  );
  return result.rows[0];
}

async function updateUserProfile(id, { name, allergies, dietaryPreference, preferredLanguage }) {
  const lang =
    preferredLanguage && String(preferredLanguage).trim() !== ''
      ? String(preferredLanguage).trim()
      : 'en';
  const result = await pool.query(
    `UPDATE users
     SET name = $2,
         allergies = $3,
         dietary_preference = $4,
         preferred_language = $5
     WHERE id = $1
     RETURNING id, name, email, role, allergies, dietary_preference, preferred_language`,
    [id, name, allergies ?? null, dietaryPreference ?? null, lang]
  );
  return result.rows[0] || null;
}

function isValidRole(role) {
  return ROLES.includes(role);
}

module.exports = {
  ROLES,
  ensureUsersTable,
  rowToPublicUser,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  isValidRole,
};
