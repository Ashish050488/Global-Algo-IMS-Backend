const Attendance = require('../models/Attendance');

const gatekeeper = async (req, res, next) => {
  try {
    // 1. Admin Immunity (Admins never need to mark attendance)
    if (req.user.role === 'Admin') {
      return next();
    }

    // 2. Define "Today" (Matches YYYY-MM-DD stored in DB)
    const today = new Date().toISOString().split('T')[0];

    // 3. Check DB for ANY record today
    // We don't care about the specific status (Online/Break/etc), just that they clocked in.
    const record = await Attendance.findOne({ 
      user: req.user.id, 
      date: today 
    });

    // 4. If no record exists, they haven't "Clocked In" yet.
    if (!record) {
      return res.status(403).json({ 
        msg: "ACCESS DENIED: You must clock in (start attendance) to access data." 
      });
    }

    // 5. Allowed
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Gatekeeper Error" });
  }
};

module.exports = gatekeeper;