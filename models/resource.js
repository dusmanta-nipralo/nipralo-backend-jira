const mongoose = require("mongoose");
const ResourceSchema = new mongoose.Schema({
  clientId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Client',
  required: true
},
  name: {
    type: String,
    required: true,
  },
  date: { 
    type: Date, 
    default: Date.now,
    required: true
 },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  level:{
    type:Number,
     enum:[1,5],
     default:1
  },
   resourceCount: { type: Number, default: 0 }
});

module.exports = {
  ResourceSchema,
  Resource: mongoose.model("Resource", ResourceSchema),
};
