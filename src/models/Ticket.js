const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // NEW: Who is this ticket for?
  recipient: { 
    type: String, 
    enum: ['Admin', 'BranchManager'], 
    default: 'Admin' 
  },

  category: { 
    type: String, 
    enum: ['Complaint', 'IT Issue', 'Harassment', 'Suggestion', 'Other'], 
    default: 'Other' 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  adminResponse: String 
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);