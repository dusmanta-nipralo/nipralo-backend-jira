const mongoose = require('mongoose');

const sprintActivitySchema = new mongoose.Schema({
  name: String,
  goal: String,
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned'
  },
  startedAt: Date,
  endedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('SprintActivity', sprintActivitySchema);
