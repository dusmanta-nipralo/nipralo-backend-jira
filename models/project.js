const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  lead: String,
  openTasks: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  status: {
    type: Number,
    enum: [1, 5], // 1 = active, 5 = soft-deleted
    default: 1
  },
  starred:{
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model('Project', ProjectSchema);
