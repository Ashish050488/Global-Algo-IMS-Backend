const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  
  // Current active status
  currentStatus: { 
    type: String, 
    enum: ['Online', 'Offline', 'On-call', 'Break', 'Evaluation', 'Lunch Time'], 
    default: 'Offline' 
  },
  
  // The exact time the status last changed (used to calculate live duration)
  lastStatusChange: { type: Date, default: Date.now },

  // Accumulated durations (in minutes) for the day
  durations: {
    Online: { type: Number, default: 0 },
    'On-call': { type: Number, default: 0 },
    Break: { type: Number, default: 0 },     // Limit: 20 mins
    'Lunch Time': { type: Number, default: 0 }, // Limit: 40 mins
    Evaluation: { type: Number, default: 0 },
    Offline: { type: Number, default: 0 }    // Limit: 16 hours (buffer)
  },

  // Detailed Log for Auditing (The "Black Box")
  history: [{
    status: String,
    startTime: Date,
    endTime: Date,
    durationMinutes: Number
  }]
});

// Ensure one record per user per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);