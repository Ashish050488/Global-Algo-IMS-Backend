const mongoose = require('mongoose');

const UploadBatchSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
  totalCount: { type: Number, required: true }
});

module.exports = mongoose.model('UploadBatch', UploadBatchSchema);