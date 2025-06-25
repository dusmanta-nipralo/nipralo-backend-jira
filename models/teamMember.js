const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
       required: false, // ⬅️ Change from true to false
    default: null 
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: {
    type: String,
   // default: 'member'
  },
  status: {
    type: Number,
    enum: [1, 5], // 1 = Active, 5 = Soft-deleted
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
