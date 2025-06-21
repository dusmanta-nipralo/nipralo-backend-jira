const mongoose = require('mongoose');

const epicSchema = new mongoose.Schema({
  epicName: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  color: {
    type: String,
    match: /^#([0-9A-Fa-f]{6})$/,
    default: '#0052CC'
  },
//   projectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   sprintId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Sprint',
//     default: null
//   },
  level: {
    type: Number,
    enum: [1, 5],
    default: 1 // 1 = active, 5 = deleted
  }
}, { timestamps: true });

module.exports = mongoose.model('Epic', epicSchema);
