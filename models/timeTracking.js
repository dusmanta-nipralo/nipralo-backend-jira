const mongoose = require('mongoose');

const TimeEntrySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  member: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hours: {
    type: Number,
    required: true
  },
  status: {
    type: Number,
    enum: [1, 5], // 1 = active, 5 = deleted
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TimeEntry', TimeEntrySchema);
