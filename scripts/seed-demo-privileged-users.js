#!/usr/bin/env node
/**
 * Privileged accounts are seeded manually for prototype demonstration.
 * In production, they would be created by the platform owner or identity administrator.
 *
 * Usage (from repo root):
 *   node scripts/seed-demo-privileged-users.js
 */
const path = require('path');
const apiRoot = path.join(__dirname, '../fabric-api');

require(path.join(apiRoot, 'node_modules/dotenv')).config({
  path: path.join(apiRoot, '.env'),
});

const bcrypt = require(path.join(apiRoot, 'node_modules/bcrypt'));
const pool = require(path.join(apiRoot, 'config/db'));
const userService = require(path.join(apiRoot, 'services/userService'));

const BCRYPT_ROUNDS = 10;

const DEMO_USERS = [
  {
    name: 'Demo Admin',
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
  },
  {
    name: 'Demo Regulator',
    email: 'regulator@test.com',
    password: 'Regulator123!',
    role: 'regulator',
  },
];

async function upsertPrivilegedUser({ name, email, password, role }) {
  await userService.ensureUsersTable();
  const existing = await userService.findUserByEmail(email);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  if (existing) {
    await pool.query(
      `UPDATE users SET name = $1, password_hash = $2, role = $3 WHERE id = $4`,
      [name, passwordHash, role, existing.id]
    );
    console.log(`Updated ${role}: ${email}`);
    return;
  }

  await userService.createUser({
    name,
    email,
    passwordHash,
    role,
    allergies: null,
    dietaryPreference: null,
    preferredLanguage: 'en',
  });
  console.log(`Created ${role}: ${email}`);
}

async function main() {
  for (const u of DEMO_USERS) {
    await upsertPrivilegedUser(u);
  }
  console.log('Done. Demo logins: admin@test.com / Admin123! , regulator@test.com / Regulator123!');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
