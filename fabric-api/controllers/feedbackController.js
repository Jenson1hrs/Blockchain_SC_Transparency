const feedbackService = require('../services/feedbackService');

exports.submit = async (req, res) => {
  try {
    const { category, rating, message, likertResponses } = req.body || {};
    const row = await feedbackService.createFeedback({
      userId: req.user?.id ?? null,
      role: req.user?.role ?? req.body?.role ?? null,
      category,
      rating,
      likertResponses,
      message,
    });
    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback.',
      data: row,
    });
  } catch (e) {
    const status = e.statusCode || 500;
    if (status >= 500) console.error('feedback submit', e);
    return res.status(status).json({ success: false, message: e.message });
  }
};

exports.list = async (req, res) => {
  try {
    const limit = req.query.limit;
    const rows = await feedbackService.listFeedback({ limit });
    return res.json({ success: true, data: rows, count: rows.length });
  } catch (e) {
    console.error('feedback list', e);
    return res.status(500).json({ success: false, message: 'Failed to load feedback' });
  }
};
