let Settings = require('../models/settings');

exports.createSetting = async (req,res)=>{
    let {project_name,project_key,Description,Category,Visibility}= req.body;
        let setting =  new Settings({project_name,project_key,Description,Category,Visibility});
        await setting.save();
        res.json(setting);
}

exports.updateSetting =  async (request,response)=>{
    let setting = await Settings.findOneAndUpdate(
        {_id:request.params.id},
        request.body,
        {new:true,runValidators:true}
    )
    response.json(setting)
}

exports.getSettings = async (req,res)=>{
    let setting = await Settings.find();
    res.json(setting);
}

exports.getSettingsById = async (req,res)=>{
    let setting = await Settings.findOne({_id:req.params.id,level:1})
    if(!setting){
        res.json({error:"Settings details not found"})
    }
    res.json(setting)
}

exports.softDeleteSetting = async (req,res)=>{
    let setting = await Settings.findOne({_id:req.params.id,level:1})
    setting.level = 5;
    await setting.save();
    res.json({message:"Deleted"})
}

exports.restoreSetting =  async (req,res)=>{
    let setting = await Settings.findOne({_id:req.params.id,level:5})
    setting.level=1;
    res.json({message:"restored"})
}