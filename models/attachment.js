const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  workId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',  // Assuming this is your task model
    required: true
  },
  attachments: [
    {
      public_id: String,
      url: String,
      resource_type: String,
      secure_url: String
    }
  ]
});

module.exports = mongoose.model('Attachment', attachmentSchema);
