const mongoose = require('mongoose');

const NameplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, default: '' },
  macAddress: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Nameplate', NameplateSchema);