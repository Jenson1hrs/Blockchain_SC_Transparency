const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || String(s).trim() === '') {
    throw new Error('JWT_SECRET is not set in environment');
  }
  return s;
}

/**
 * Requires Authorization: Bearer <token>. Sets req.user = { id, email, role }.
 */
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret());
    const id = payload.sub ?? payload.id;
    if (id == null) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }
    req.user = {
      id: typeof id === 'string' ? parseInt(id, 10) : id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Call after authenticateUser. Pass allowed role strings.
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: your role cannot use this feature.',
      });
    }
    next();
  };
}

module.exports = {
  authenticateUser,
  authorizeRoles,
  getJwtSecret,
};
