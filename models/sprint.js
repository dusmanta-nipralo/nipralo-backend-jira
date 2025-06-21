const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  sprintName: {
    type: String,
    required: true
  },
  sprintGoal: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  level: {
    type: Number,
    enum: [1, 5],
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Sprint', sprintSchema);
