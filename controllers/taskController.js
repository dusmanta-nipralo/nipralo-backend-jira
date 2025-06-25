const Task = require('../models/task');
const mongoose = require('mongoose');
// Create Task
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};

// Get All Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ level: 1 }).populate('assignee');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

// Get Task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, level: 1 }).populate('assignee');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task', error: err.message });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, level: 1 },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
};

// Soft Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, level: 1 },
      { level: 5 },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};

// Restore Soft Deleted Task
exports.restoreTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, level: 5 },
      { level: 1 },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found or not deleted' });
    res.json({ message: 'Task restored successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error restoring task', error: err.message });
  }
};

//filter task
exports.filterTask = async (req, res) => {
  try {
    const { type, priority, assignee } = req.query;

    const filter = { level: 1 };

    if (type) filter.type = new RegExp(`^${type}$`, 'i');
     // case-insensitive
    else if (priority) {
       filter.priority = new RegExp(`^${priority}$`, 'i');
    // Match by ObjectId if provided
  }else if (assignee && mongoose.Types.ObjectId.isValid(assignee)) {
      filter.assignee = assignee;
    }

    const tasks = await Task.find(filter).populate('assignee');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

