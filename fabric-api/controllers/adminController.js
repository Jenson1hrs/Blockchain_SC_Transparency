const userService = require('../services/userService');
const {
  checkDatabaseHealth,
  checkBlockchainHealth,
} = require('../services/systemHealthService');

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
  const database = await checkDatabaseHealth();
  const blockchain = await checkBlockchainHealth();

  return res.json({
    success: true,
    timestamp,
    api: 'online',
    database,
    blockchain,
  });
};
