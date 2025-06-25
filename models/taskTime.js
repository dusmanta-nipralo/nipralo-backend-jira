let Mongoose = require('mongoose');

let taskTimeSchema = new Mongoose.Schema({
    date:{
       type:  Date,
    required :true
}, 
 timeSpent: {
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 }
  },
  teamMember:{
    type:Mongoose.Schema.Types.ObjectId,
    ref:'TeamMember'
  },
  epic:{
    type:Mongoose.Schema.Types.ObjectId,
    ref:'Epic'
  },
  task_description:{
    type:String,
    required:true,
  },
  status:{
    type:String,
    enum:['Submitted','Approved','Rejected'],
    default:null
  },
    level: {
    type: Number,
    enum: [1, 5],
    default: 1 // 1 = active, 5 = deleted
  }

},{timestamps:true});

module.exports = Mongoose.model('TaskTime',taskTimeSchema)