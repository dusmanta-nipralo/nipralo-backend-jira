const jwt = require('jsonwebtoken');
// Auth middleware to validate user JWT
const validateAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ message: 'Authentication token missing or malformed' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload (e.g., userId, role, email)
    next();
  } catch (error) {
    return res.json({ message: 'Invalid or expired authentication token' });
  }
};
module.exports = validateAuth;
