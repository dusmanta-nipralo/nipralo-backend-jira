const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // or 'Client' if you're calling it client
    required: true
  },
  level: {
    type: Number,
    enum: [1, 5], // 1 = active, 5 = soft-deleted
    default: 1
  }
}, { timestamps: true });

milestoneSchema.set('toJSON', {
  transform: function (doc, ret) {
    if (ret.dueDate) {
      const date = new Date(ret.dueDate);
      ret.dueDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
    }
    return ret;
  }
});

module.exports = mongoose.model('Milestone', milestoneSchema);
