const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskTitle: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Testing', 'Done'],
    default: 'To Do'
  },
//   settingId: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'Setting',
//   default: null
// },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false,
    default: null
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  type: {
    type: String,
    enum: ['Task', 'Bug', 'Story'],
    default: 'Task'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  },
  dueDate: Date,
  level: {
    type: Number,
    enum: [1, 5],
    default: 1
  },
  timeSpent: {
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
