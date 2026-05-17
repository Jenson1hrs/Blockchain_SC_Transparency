const notificationService = require('../services/notificationService');
const notificationSyncService = require('../services/notificationSyncService');
const userService = require('../services/userService');

exports.listNotifications = async (req, res) => {
  try {
    const userRow = await userService.findUserById(req.user.id);
    await notificationSyncService.syncDerivedNotifications(req.user.id, userRow);

    const readStatus = req.query.readStatus || req.query.read || 'all';
    const severity = req.query.severity;
    const limit = req.query.limit;

    const data = await notificationService.getUserNotifications(req.user.id, {
      readStatus,
      severity,
      limit,
    });
    return res.json({ success: true, data });
  } catch (e) {
    console.error('listNotifications', e);
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

exports.unreadCount = async (req, res) => {
  try {
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    return res.json({ success: true, unreadCount });
  } catch (e) {
    console.error('unreadCount', e);
    return res.status(500).json({ success: false, message: 'Failed to load unread count' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }
    const updated = await notificationService.markNotificationRead(req.user.id, id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (e) {
    console.error('markRead', e);
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await notificationService.markAllNotificationsRead(req.user.id);
    return res.json({ success: true });
  } catch (e) {
    console.error('markAllRead', e);
    return res.status(500).json({ success: false, message: 'Failed to mark notifications read' });
  }
};
