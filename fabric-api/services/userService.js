const pool = require('../config/db');
const organizationService = require('./organizationService');

const ROLES = ['admin', 'manufacturer', 'distributor', 'retailer', 'consumer', 'regulator'];
/** Roles allowed via public POST /auth/register (admin/regulator are seeded separately). */
const PUBLIC_REGISTRATION_ROLES = ['consumer', 'manufacturer', 'distributor', 'retailer'];
const SUPPLY_CHAIN_ROLES = ['manufacturer', 'distributor', 'retailer'];

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','manufacturer','distributor','retailer','consumer','regulator')),
      allergies TEXT,
      dietary_preference TEXT,
      preferred_language TEXT DEFAULT 'en',
      theme_preference TEXT DEFAULT 'light',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light'
  `);
  await organizationService.ensureOrganizationColumns();
  await ensureRegulatorRoleConstraint();
}

/** Allow `regulator` on databases created before that role existed. */
async function ensureRegulatorRoleConstraint() {
  try {
    await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
    await pool.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('admin','manufacturer','distributor','retailer','consumer','regulator'))
    `);
  } catch {
    /* prototype: application-level isValidRole still enforces */
  }
}

function normalizeTheme(value) {
  return value === 'dark' ? 'dark' : 'light';
}

function rowToPublicUser(row) {
  if (!row) return null;
  const base = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    allergies: row.allergies ?? null,
    dietaryPreference: row.dietary_preference ?? null,
    preferredLanguage: row.preferred_language ?? 'en',
    themePreference: normalizeTheme(row.theme_preference),
  };
  if (SUPPLY_CHAIN_ROLES.includes(row.role)) {
    return {
      ...base,
      companyName: row.company_name ?? null,
      companyDescription: row.company_description ?? null,
      companyWebsite: row.company_website ?? null,
      companyLogoUrl: row.company_logo_url ?? null,
      companyLocation: row.company_location ?? null,
    };
  }
  return base;
}

async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [
    email,
  ]);
  return result.rows[0] || null;
}

async function findUserById(id) {
  await ensureUsersTable();
  const result = await pool.query(
    `SELECT id, name, email, role, allergies, dietary_preference, preferred_language, theme_preference,
            company_name, company_description, company_website, company_logo_url, company_location,
            created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function createUser({ name, email, passwordHash, role, allergies, dietaryPreference, preferredLanguage }) {
  const lang = preferredLanguage && String(preferredLanguage).trim() !== '' ? preferredLanguage : 'en';
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, allergies, dietary_preference, preferred_language)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role, allergies, dietary_preference, preferred_language, theme_preference`,
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

async function updateUserProfile(
  id,
  {
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
    role,
  }
) {
  const lang =
    preferredLanguage && String(preferredLanguage).trim() !== ''
      ? String(preferredLanguage).trim()
      : 'en';
  const themeSql =
    themePreference === 'light' || themePreference === 'dark'
      ? themePreference
      : null;

  const orgFields =
    role && SUPPLY_CHAIN_ROLES.includes(role)
      ? {
          company_name:
            companyName != null ? String(companyName).trim() || null : undefined,
          company_description:
            companyDescription != null
              ? String(companyDescription).trim() || null
              : undefined,
          company_website:
            companyWebsite != null ? String(companyWebsite).trim() || null : undefined,
          company_logo_url:
            companyLogoUrl != null ? String(companyLogoUrl).trim() || null : undefined,
          company_location:
            companyLocation != null ? String(companyLocation).trim() || null : undefined,
        }
      : null;

  const result = await pool.query(
    `UPDATE users
     SET name = $2,
         allergies = $3,
         dietary_preference = $4,
         preferred_language = $5,
         theme_preference = COALESCE($6, theme_preference),
         company_name = COALESCE($7, company_name),
         company_description = COALESCE($8, company_description),
         company_website = COALESCE($9, company_website),
         company_logo_url = COALESCE($10, company_logo_url),
         company_location = COALESCE($11, company_location)
     WHERE id = $1
     RETURNING id, name, email, role, allergies, dietary_preference, preferred_language, theme_preference,
               company_name, company_description, company_website, company_logo_url, company_location`,
    [
      id,
      name,
      allergies ?? null,
      dietaryPreference ?? null,
      lang,
      themeSql,
      orgFields?.company_name ?? null,
      orgFields?.company_description ?? null,
      orgFields?.company_website ?? null,
      orgFields?.company_logo_url ?? null,
      orgFields?.company_location ?? null,
    ]
  );
  return result.rows[0] || null;
}

function getManufacturerDisplayName(userRow) {
  if (!userRow) return '';
  const company = userRow.company_name != null ? String(userRow.company_name).trim() : '';
  if (company) return company;
  return String(userRow.name || '').trim();
}

function isValidRole(role) {
  return ROLES.includes(role);
}

async function listAllUsers() {
  await ensureUsersTable();
  const result = await pool.query(
    `SELECT id, name, email, role, preferred_language, created_at
     FROM users
     ORDER BY id ASC`
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    preferredLanguage: row.preferred_language ?? 'en',
    createdAt: row.created_at,
  }));
}

function isPublicRegistrationRole(role) {
  return PUBLIC_REGISTRATION_ROLES.includes(role);
}

module.exports = {
  ROLES,
  PUBLIC_REGISTRATION_ROLES,
  isPublicRegistrationRole,
  SUPPLY_CHAIN_ROLES,
  ensureUsersTable,
  rowToPublicUser,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  getManufacturerDisplayName,
  isValidRole,
  listAllUsers,
};
