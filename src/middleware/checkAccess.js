const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

const gatekeeper = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // "2025-12-09"
    
    // 1. Verify Token (Standard Auth)
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains { id, role }

    // 2. MASTER EXCEPTION: Admin/Owner needs no attendance
    if (req.user.role === 'Admin') {
      return next();
    }

    // 3. Check Attendance for everyone else
    const record = await Attendance.findOne({ 
      user: req.user.id, 
      date: today,
      status: 'Present'
    });

    if (!record) {
      // 403 Forbidden: Frontend should catch this and redirect to "Mark Attendance" page
      return res.status(403).json({ 
        msg: "ACCESS DENIED: You must mark attendance to access leads." 
      });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = gatekeeper;