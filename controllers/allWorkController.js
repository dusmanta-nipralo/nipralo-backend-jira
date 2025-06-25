const Attachment = require('../models/attachment');
const { uploadBufferToCloudinary, generateSignedUrl } = require('../utils/cloudinary');
const { generateWorkDataCSV } = require('../utils/csv');
let AllWork = require("../models/allWork")
const Setting = require('../models/settings');
const Task = require('../models/task');
const Backlog = require('../models/backlog');
const Sprint = require('../models/sprint');


exports.getAllWorkData = async (req, res) => {
  try {
    const { projectId } = req.params;
    // 1. Fetch all tasks with populated fields
    const tasks = await Task.find({ projectId, level: 1 })
      .populate('assignee', 'name email')
      .populate('projectId', 'description')
     // .populate('assignees','name')
      .lean();

    // 2. Fetch setting and backlog
    const setting = await Setting.findOne().lean();
   const backlog = await Backlog.findOne({ projectId, level: 1 })
  .populate('assignees.memberId', 'name')
  .lean();

//const all = await Sprint.find();
//console.log('All sprints:', all);

    // 3. Fetch any one sprint (e.g., first one — or filter by active/projectId later)
    const sprint = await Sprint.findOne().lean();
    console.log(sprint)
    const sprintName = sprint?.sprintName || 'No Sprint';
  console.log(sprintName)
    // 4. Build final result
const result = tasks.map(task => ({
  key: setting?.project_key || '',
  type: task.type,
  summary: backlog?.summary || '',
  status: task.status,
  assignees: Array.isArray(backlog?.assignees)
    ? backlog.assignees
        .filter(a => a.memberId)
        .map(a => ({
          name: a.memberId.name,
        }))
    : [],
  reporter: task.assignee?.name,
  priority: task.priority,
  dueDate: task.dueDate,
  estimate: `${task.timeSpent?.hours || 0}h ${task.timeSpent?.minutes || 0}m`,
  sprintName,
  description: task.projectId?.description || ''
}));


    //console.log('Total Tasks:', result.length);
    res.json(result);
  } catch (err) {
    console.error('Error in getAllWorkData with sprint lookup:', err);
    res.json({ message: 'Failed to fetch work data', error: err.message });
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    //  console.log('✅ ID:', req.params.id);
  //console.log('✅ File:', req.file);
          console.log(id)
          console.log(req.file)
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    const originalName = req.file.originalname;

    const uploadResult = await uploadBufferToCloudinary(buffer, originalName, 'allWork');
    const signedUrl = generateSignedUrl(uploadResult.public_id);

    let attachmentDoc = await Attachment.findOne({ workId: id });
    if (!attachmentDoc) {
      attachmentDoc = new Attachment({ workId: id, attachments: [] });
    }

    const newAttachment = {
      public_id: uploadResult.public_id,
      url: signedUrl,
      resource_type: uploadResult.resource_type,
      secure_url: uploadResult.secure_url
    };

    attachmentDoc.attachments.push(newAttachment);
    await attachmentDoc.save();

    res.json({
      message: 'File uploaded successfully',
      attachment: newAttachment
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload file', error: error.message });
  }
};

exports.createComment = async (request, response) => {
    const comment = new AllWork(request.body);
    await comment.save();
    response.json(comment);
};

exports.exportWorkDataCSV = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch tasks and populate necessary fields
    const tasks = await Task.find({ projectId, level: 1 })
      .populate('projectId', 'description')
      .populate('assignee', 'name')
      .lean();

    // Fetch other related data
    const setting = await Setting.findOne().lean();
    const backlog = await Backlog.findOne({ projectId, level: 1 })
      .populate('assignees.memberId', 'name email')
      .lean();
    const sprint = await Sprint.findOne({ projectId }).lean();

    // Generate CSV using updated async-compatible method
    const csv = await generateWorkDataCSV(tasks, setting, backlog, sprint);

    // Send CSV response
    res.header('Content-Type', 'text/csv');
    res.attachment('work-data.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting work data CSV:', err);
    res.status(500).json({ message: 'Failed to export CSV', error: err.message });
  }
};

