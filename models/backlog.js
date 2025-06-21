const mongoose = require('mongoose');

const backlogSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  summary: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['TO DO', 'IN PROGRESS', 'DONE'],
    default: 'TO DO'
  },
  assignees: [
    {
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeamMember'
      },
      name: String
    }
  ],
  estimate: {
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 }
  },
  labels: [String],
  level: {
    type: Number,
    enum: [1, 5],
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Backlog', backlogSchema);
