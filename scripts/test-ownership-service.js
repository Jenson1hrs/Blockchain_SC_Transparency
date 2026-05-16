/**
 * Unit-style checks for ownership SQL helpers (no Fabric required).
 * Run: node scripts/test-ownership-service.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../fabric-api/.env') });

const ownershipService = require('../fabric-api/services/ownershipService');

async function main() {
  await ownershipService.ensureOwnershipColumns();

  const mfgWhere = ownershipService.listWhereForRole('manufacturer', 1);
  const distWhere = ownershipService.listWhereForRole('distributor', 2);
  const retailWhere = ownershipService.listWhereForRole('retailer', 3);

  if (!mfgWhere.sql.includes('manufacturer_user_id')) {
    throw new Error('manufacturer filter missing manufacturer_user_id');
  }
  if (!distWhere.sql.includes('current_owner_user_id')) {
    throw new Error('distributor filter missing current_owner_user_id');
  }
  if (!retailWhere.sql.includes('retailer')) {
    throw new Error('retailer filter missing role check');
  }

  const users = await ownershipService.listSupplyChainUsers({ q: '', role: 'distributor' });
  if (!Array.isArray(users)) {
    throw new Error('listSupplyChainUsers did not return array');
  }
  for (const u of users) {
    if (u.role !== 'distributor') {
      throw new Error(`Expected distributor role, got ${u.role}`);
    }
  }

  console.log('ownershipService checks passed');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
