let mongoose = require('mongoose');

let settingSchema = new mongoose.Schema({
    project_name:{
        type:String,
        required:true
    },
    project_key:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Category:{
        type:String,
        enum:['Software Development','Marketing','Design','Business','Others'],
        default:'Others'
    },
    Visibility:{
        type:String,
        enum:['Private','Team','Public'],
        default:'Public'
    },
    level:{
        type:Number,
        enum:[1,5],
        default:1
    }
}, {
        timestamps:true
    }
)

module.exports = mongoose.model('Setting',settingSchema);