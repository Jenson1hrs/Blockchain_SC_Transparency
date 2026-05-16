const pool = require('../config/db');
const connectToNetwork = require('../config/fabric');

const FABRIC_OK_DETAIL =
  'Hyperledger Fabric gateway connected (supplychannel / anticounterfeit)';

async function checkDatabaseHealth() {
  try {
    await pool.query('SELECT 1');
    return { status: 'connected', detail: 'PostgreSQL reachable' };
  } catch (e) {
    return { status: 'error', detail: e.message || 'Database unreachable' };
  }
}

async function checkBlockchainHealth() {
  let gateway;
  try {
    const conn = await connectToNetwork();
    gateway = conn.gateway;
    return { status: 'connected', detail: FABRIC_OK_DETAIL };
  } catch (e) {
    return { status: 'error', detail: e.message || 'Fabric connection failed' };
  } finally {
    if (gateway) {
      try {
        gateway.disconnect();
      } catch (_) {
        /* ignore */
      }
    }
  }
}

module.exports = {
  checkDatabaseHealth,
  checkBlockchainHealth,
  FABRIC_OK_DETAIL,
};
