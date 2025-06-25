let TaskTime = require('../models/taskTime');

exports.createTaskTime = async (request,response)=>{
   let {date,timeSpent,status,teamMember,epic,task_description,level} = request.body;
   let tasktime = new TaskTime({date,timeSpent,status,teamMember,epic,task_description,level})
     await tasktime.save();
     response.json(tasktime);
}

exports.updateTaskTime = async (request,response)=>{
    let tasktime = await TaskTime.findOneAndUpdate(
        {_id:request.params.id},
        request.body,
        {new:true,runValidators:true}
    )
    response.json(tasktime)
}

exports.getTaskTime = async (request,response)=>{
    let tasktime = await TaskTime.find().populate('teamMember').populate('epic')
    response.json(tasktime);
}

exports.getTaskTimeById = async (request,response)=>{
    let tasktime = await TaskTime.findOne({_id:request.params.id,level:1}).populate('teamMember').populate('epic')
    response.json(tasktime);
}

exports.softDelete = async (req, res) => {
  try {
    const task = await TaskTime.findOneAndUpdate(
      { _id: req.params.id, level: 1 },
      { level: 5 },
      { new: true }
    );
    console.log(task)
   // if (!task) return res.json({ message: 'Task not found' });
    res.json({ message: 'Task-time deleted successfully' });
  } catch (err) {
    res.json({ message: 'Error deleting task', error: err.message });
  }
};

exports.restore = async (request,response)=>{
    let tasktime = await TaskTime.findOne({_id:request.params.id,level:5})
    tasktime.level = 1;
    response.json({message:`restored successfully`})
}


//filter
exports.filterTaskTime = async (req, res) => {
  try {
    const { teamMember, status, date } = req.query;

    const filter = { level: 1 };

    if (teamMember) {
      filter.teamMember = teamMember;
    }

    if (status) {
      // Assuming you're storing status in task_description or another field, adapt as needed.
      filter.task_description = new RegExp(status, 'i'); // flexible match
    }

    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(dateObj.getDate() + 1);
      filter.date = { $gte: dateObj, $lt: nextDay };
    }

    const logs = await TaskTime.find(filter)
      .populate('teamMember')
      .populate('epic')
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to filter task time logs',
      error: err.message
    });
  }
};
