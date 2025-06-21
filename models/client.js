const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: String,
  project: String,
  contact: String,
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status:{
    type:Number,
    enum:[1,5],
    default:1
  },
  resourceCount: { type: Number, default: 0 }, 

});

module.exports = mongoose.model('Client', ClientSchema);
