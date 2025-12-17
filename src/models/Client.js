const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  // Link to the original Lead (so we know where they came from)
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  
  // The Employee managing this client
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Personal Info
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },

  // Trading Profile
  tradingPlatform: { 
    type: String, 
    enum: ['Zerodha', 'Groww', 'AngelOne', 'Upstox', 'Other'],
    default: 'Other'
  },
  investmentCapital: { type: Number, default: 0 },
  riskAppetite: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },

  // KYC & Registration Status
  registrationStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  kycDocuments: {
    panCard: String, // We will store URLs here later
    aadharCard: String
  },
  
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);