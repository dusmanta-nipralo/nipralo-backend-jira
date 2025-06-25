const Sprint = require('../models/sprint');
const Backlog = require('../models/backlog');

// Create Sprint
exports.createSprint = async (req, res) => {
  try {
    const sprint = new Sprint(req.body);
    await sprint.save();
    res.status(201).json(sprint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create sprint', details: err.message });
  }
};

// Get All Sprints
exports.getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find({ level: 1 });
    res.json(sprints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sprints' });
  }
};

// Get Sprint by ID (with backlogs)
exports.getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findOne({ _id: req.params.id, level: 1 });
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });

    const backlogs = await Backlog.find({ sprintId: sprint._id, level: 1 });
    res.json({ sprint, backlogs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sprint' });
  }
};

// Update Sprint
exports.updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findOneAndUpdate(
      { _id: req.params.id, level: 1 },
      req.body,
      { new: true, runValidators: true }
    );
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update sprint' });
  }
};

// Soft Delete Sprint
exports.softDeleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findOne({ _id: req.params.id, level: 1 });
    if (!sprint) return res.status(404).json({ error: 'Sprint not found or already deleted' });

    sprint.level = 5;
    await sprint.save();
    res.json({ message: 'Sprint deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete sprint' });
  }
};

// Restore Sprint
exports.restoreSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findOne({ _id: req.params.id, level: 5 });
    if (!sprint) return res.status(404).json({ error: 'Sprint not found or not deleted' });

    sprint.level = 1;
    await sprint.save();
    res.json({ message: 'Sprint restored' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore sprint' });
  }
};


exports.getSprintSummary = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });

    const allTasks = await Backlog.find({
      sprintId: sprint._id,
      level: 1
    });

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'DONE').length;

    const backlogCount = totalTasks; // Same as above, kept for clarity

    const now = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Calculate progress
    const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const completionSummary = `${completedTasks} of ${totalTasks} tasks (${completionPercent}%)`;

    // Determine status
    let status;
    if (now < start) {
      status = 'Not Started';
    } else if (now >= start && now <= end) {
      status = 'In Progress';
    } else if (completedTasks < totalTasks) {
      const overdueDays = Math.ceil((now - end) / (1000 * 60 * 60 * 24));
      status = `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
    } else {
      status = 'Completed';
    }

    res.json({
      sprintName: sprint.sprintName,
      sprintGoal: sprint.sprintGoal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      duration,
      status,
      backlogCount,
      completedTasks,
      completionSummary
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sprint summary', details: err.message });
  }
};

