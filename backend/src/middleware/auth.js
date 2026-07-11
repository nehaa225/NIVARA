const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nivara_super_secret_key_123_change_this_in_production';

// Verify JWT token and attach user payload to request
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = decoded; // Attach user payload ({ id, email, role })
    next();
  });
};

// Check if user has specific roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied. Insufficient privileges.' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
