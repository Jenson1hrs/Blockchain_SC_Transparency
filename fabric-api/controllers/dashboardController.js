const userService = require('../services/userService');
const dashboardService = require('../services/dashboardService');

exports.summary = async (req, res) => {
  try {
    const role = req.user?.role;
    if (!role || !userService.isValidRole(role)) {
      return res.status(403).json({ success: false, message: 'Invalid role for dashboard' });
    }

    await userService.ensureUsersTable();
    const userRow = await userService.findUserById(req.user.id);

    const data = await dashboardService.getSummaryByRole(role, req.user.id, userRow);
    if (data == null) {
      return res.status(403).json({ success: false, message: 'Unsupported role for dashboard summary' });
    }

    return res.json({
      success: true,
      role,
      data,
    });
  } catch (e) {
    console.error('dashboard summary', e);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard summary' });
  }
};
