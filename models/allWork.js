let Mongoose = require('mongoose')

let allWorkSchema = new Mongoose.Schema({
    comment :{
        type:String,
        required:false
    },
},{timestamps:true})

module.exports = Mongoose.model('AllWork',allWorkSchema)