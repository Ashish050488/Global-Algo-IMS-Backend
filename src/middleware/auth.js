const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const cleanToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = decoded; // Adds { id, role } to request
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};