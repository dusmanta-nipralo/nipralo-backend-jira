const Milestone = require('../models/milestone');

// Create a milestone for a project
exports.createMilestone = async (req, res) => {
  try {
    const { title, dueDate, status, projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    const milestone = new Milestone({ title, dueDate, status, projectId });
    await milestone.save();

    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create milestone.', details: err.message });
  }
};

// Get all active milestones for a specific project
exports.getMilestonesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const milestones = await Milestone.find({ projectId, level: 1 });
    res.status(200).json(milestones);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch milestones.', details: err.message });
  }
};

// Get a single milestone by ID (only if active)
exports.getMilestoneById = async (req, res) => {
  try {
    const milestone = await Milestone.findOne({ _id: req.params.id, level: 1 });
    if (!milestone) return res.status(404).json({ error: 'Milestone not found or deleted.' });

    res.status(200).json(milestone);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch milestone.' });
  }
};

// Update a milestone (only if active)
exports.updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findOneAndUpdate(
      { _id: req.params.id, level: 1 },
      req.body,
      { new: true, runValidators: true }
    );

    if (!milestone) return res.status(404).json({ error: 'Milestone not found or deleted.' });

    res.status(200).json(milestone);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update milestone.' });
  }
};

// Soft delete a milestone
exports.softDeleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findOne({ _id: req.params.id, level: 1 });
    if (!milestone) return res.status(404).json({ message: 'Milestone not found or already deleted' });

    milestone.level = 5;
    await milestone.save();

    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete milestone', error: err.message });
  }
};

// Restore a soft-deleted milestone
exports.restoreMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findOne({ _id: req.params.id, level: 5 });
    if (!milestone) return res.status(404).json({ message: 'Milestone not found or not deleted' });

    milestone.level = 1;
    await milestone.save();

    res.json({ message: 'Milestone restored' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to restore milestone', error: err.message });
  }
};
