const express = require('express');
const router = express.Router();
const { updateStatus, getStatus, getCalendarData } = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

// Note: NO gatekeeper here. These allow the user to enter the system.
router.post('/status', auth, updateStatus); // Toggle Status (Auto Clock-in)
router.get('/current', auth, getStatus);    // Get Live Timer
router.get('/calendar', auth, getCalendarData); // Get Monthly View

module.exports = router;