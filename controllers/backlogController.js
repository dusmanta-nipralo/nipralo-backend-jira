const Backlog = require('../models/backlog');

// CREATE Backlog item
exports.createBacklog = async (req, res) => {
  try {
    const backlog = new Backlog(req.body);
    await backlog.save();
    res.status(201).json(backlog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create backlog item', details: err.message });
  }
};

// READ all Backlogs (optionally filter by sprint)
exports.getAllBacklogs = async (req, res) => {
  try {
    const filter = { level: 1 };
    if (req.query.sprintId) {
      filter.sprintId = req.query.sprintId;
    }
    const backlogs = await Backlog.find(filter);
    res.json(backlogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch backlog items' });
  }
};

// READ single Backlog by ID
exports.getBacklogById = async (req, res) => {
  try {
    const backlog = await Backlog.findOne({ _id: req.params.id, level: 1 });
    if (!backlog) return res.status(404).json({ error: 'Backlog item not found' });
    res.json(backlog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch backlog item' });
  }
};

//?get backlog by sprint
// Get All Backlogs for a Sprint
exports.getBacklogsBySprint = async (req, res) => {
  try {
    const backlogs = await Backlog.find({ sprintId: req.params.sprintId, level: 1 });
    res.json(backlogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch backlogs' });
  }
};

// UPDATE Backlog
exports.updateBacklog = async (req, res) => {
  try {
    const backlog = await Backlog.findOneAndUpdate(
      { _id: req.params.id, level: 1 },
      req.body,
      { new: true, runValidators: true }
    );
    if (!backlog) return res.status(404).json({ error: 'Backlog item not found' });
    res.json(backlog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update backlog item' });
  }
};

// SOFT DELETE Backlog
exports.softDeleteBacklog = async (req, res) => {
  try {
    const backlog = await Backlog.findOne({ _id: req.params.id, level: 1 });
    if (!backlog) return res.status(404).json({ error: 'Backlog item not found or already deleted' });

    backlog.level = 5;
    await backlog.save();
    res.json({ message: 'Backlog  deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete backlog item' });
  }
};

// RESTORE Backlog
exports.restoreBacklog = async (req, res) => {
  try {
    const backlog = await Backlog.findOne({ _id: req.params.id, level: 5 });
    if (!backlog) return res.status(404).json({ error: 'Backlog item not found or not deleted' });

    backlog.level = 1;
    await backlog.save();
    res.json({ message: 'Backlog restored' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore backlog item' });
  }
};
