const pool = require('../config/db');
const connectToNetwork = require('../config/fabric');
const userService = require('../services/userService');

exports.listUsers = async (req, res) => {
  try {
    const users = await userService.listAllUsers();
    const byRole = {};
    userService.ROLES.forEach((r) => {
      byRole[r] = users.filter((u) => u.role === r).length;
    });
    return res.json({
      success: true,
      data: users,
      roleCounts: byRole,
    });
  } catch (e) {
    console.error('listUsers', e);
    return res.status(500).json({ success: false, message: 'Failed to load users' });
  }
};

exports.systemStatus = async (req, res) => {
  const timestamp = new Date().toISOString();

  let database = { status: 'error', detail: '' };
  try {
    await pool.query('SELECT 1');
    database = { status: 'connected', detail: 'PostgreSQL reachable' };
  } catch (e) {
    database = { status: 'error', detail: e.message || 'Database unreachable' };
  }

  let blockchain = { status: 'unknown', detail: 'Not checked' };
  let gateway;
  try {
    const conn = await connectToNetwork();
    gateway = conn.gateway;
    blockchain = {
      status: 'connected',
      detail: 'Hyperledger Fabric gateway connected (supplychannel / anticounterfeit)',
    };
  } catch (e) {
    blockchain = {
      status: 'error',
      detail: e.message || 'Fabric connection failed',
    };
  } finally {
    if (gateway) {
      try {
        gateway.disconnect();
      } catch (_) {
        /* ignore */
      }
    }
  }

  return res.json({
    success: true,
    timestamp,
    api: 'online',
    database,
    blockchain,
  });
};
