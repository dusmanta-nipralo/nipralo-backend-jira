// models/statusColumn.js
const mongoose = require('mongoose');

const StatusColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String, // Example: '#f9f9f9' or 'bg-blue-500'
    required: true,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // or your board model
    required: true,
  },
  status: {
    type: Number,
    enum: [1, 5], // 1 = Active, 5 = Deleted (soft delete)
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StatusColumn', StatusColumnSchema);
