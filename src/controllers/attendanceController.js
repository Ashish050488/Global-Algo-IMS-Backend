const Attendance = require('../models/Attendance');

// 1. TOGGLE STATUS (Auto-Clock In + Precision Timer)
exports.updateStatus = async (req, res) => {
  const { newStatus } = req.body; 
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];
  const validStatuses = ['Online', 'Offline', 'On-call', 'Break', 'Evaluation', 'Lunch Time'];

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ msg: "Invalid Status provided." });
  }

  try {
    // Check if record exists
    let attendance = await Attendance.findOne({ user: userId, date: today });

    const now = new Date();

    // --- SCENARIO A: FIRST ACTION OF DAY (CLOCK IN) ---
    if (!attendance) {
      attendance = new Attendance({
        user: userId,
        date: today,
        currentStatus: newStatus,
        lastStatusChange: now,
        durations: { Offline: 0, Online: 0, 'On-call': 0, Break: 0, 'Lunch Time': 0, Evaluation: 0 },
        history: [{ status: newStatus, startTime: now }]
      });
      await attendance.save();
      return res.json({ 
        msg: `Clocked In! Status: ${newStatus}`, 
        currentStatus: newStatus, 
        durations: attendance.durations 
      });
    }

    // --- SCENARIO B: SWITCHING STATUS ---
    const oldStatus = attendance.currentStatus;
    if (oldStatus === newStatus) {
      return res.json({ msg: `You are already ${newStatus}` });
    }

    // Calculate Seconds spent in previous status
    const lastChange = new Date(attendance.lastStatusChange);
    const diffMs = now - lastChange;
    const diffSeconds = Math.floor(diffMs / 1000);

    // Update Durations
    if (!attendance.durations) attendance.durations = {};
    const currentTotal = attendance.durations[oldStatus] || 0;
    attendance.durations[oldStatus] = currentTotal + diffSeconds;

    // Log History
    if (attendance.history.length > 0) {
      const lastEntry = attendance.history[attendance.history.length - 1];
      lastEntry.endTime = now;
      lastEntry.durationMinutes = (diffSeconds / 60).toFixed(2);
    }
    attendance.history.push({ status: newStatus, startTime: now });

    // Update State
    attendance.currentStatus = newStatus;
    attendance.lastStatusChange = now;

    await attendance.save();
    
    res.json({ 
      msg: `Status changed to ${newStatus}`, 
      currentStatus: newStatus, 
      durations: attendance.durations 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 2. GET LIVE STATUS
exports.getStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: req.user.id, date: today });
    
    // If no record, they are essentially "Offline" with 0 duration
    if (!attendance) return res.json({ currentStatus: 'Offline', durations: {} });

    // Calculate Live Seconds
    const now = new Date();
    const activeDiffMs = now - new Date(attendance.lastStatusChange);
    const activeSeconds = Math.floor(activeDiffMs / 1000);
    
    const liveDurations = { ...attendance.durations };
    const storedTotal = liveDurations[attendance.currentStatus] || 0;
    liveDurations[attendance.currentStatus] = storedTotal + activeSeconds;

    res.json({ 
      currentStatus: attendance.currentStatus, 
      durations: liveDurations 
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// 3. GET MONTHLY CALENDAR DATA
exports.getCalendarData = async (req, res) => {
  try {
    const { month, year } = req.query; // e.g. ?month=12&year=2025
    
    // Find all records for this user matching the string "YYYY-MM-*"
    // Pad month with 0 if needed (e.g., '9' -> '09')
    const formattedMonth = String(month).padStart(2, '0');
    const regex = new RegExp(`^${year}-${formattedMonth}-`);

    const records = await Attendance.find({
      user: req.user.id,
      date: { $regex: regex }
    });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};