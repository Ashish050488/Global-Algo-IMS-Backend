const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  name: { type: String }, 
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Interested', 'Closed', 'Rejected'], 
    default: 'New' 
  },
  callCount: { type: Number, default: 0 },
  lastCallOutcome: String,
  lastCallDate: Date, 
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  // NEW: Link to the specific upload file
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadBatch' }, 
  
  history: [{
    action: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    duration: Number, 
    messageSent: String 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);