const Epic = require('../models/epic');

// Create Epic
exports.createEpic = async (req, res) => {
  try {
    const epic = new Epic(req.body);
    await epic.save();
    res.status(201).json(epic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create epic', details: err.message });
  }
};

// Get all epics
exports.getAllEpics = async (req, res) => {
  try {
    const epics = await Epic.find({ level: 1 });
    res.json(epics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch epics' });
  }
};

// Get epic by ID
exports.getEpicById = async (req, res) => {
  try {
    const epic = await Epic.findOne({ _id: req.params.id, level: 1 });
    if (!epic) return res.status(404).json({ error: 'Epic not found' });
    res.json(epic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch epic' });
  }
};

// Update epic
exports.updateEpic = async (req, res) => {
  try {
    const epic = await Epic.findOneAndUpdate(
      { _id: req.params.id, level: 1 },
      req.body,
      { new: true, runValidators: true }
    );
    if (!epic) return res.status(404).json({ error: 'Epic not found' });
    res.json(epic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update epic' });
  }
};

// Soft delete
exports.softDeleteEpic = async (req, res) => {
  try {
    const epic = await Epic.findOne({ _id: req.params.id, level: 1 });
    if (!epic) return res.status(404).json({ error: 'Epic not found or already deleted' });
    epic.level = 5;
    await epic.save();
    res.json({ message: 'Epic soft deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete epic' });
  }
};

// Restore
exports.restoreEpic = async (req, res) => {
  try {
    const epic = await Epic.findOne({ _id: req.params.id, level: 5 });
    if (!epic) return res.status(404).json({ error: 'Epic not found or not deleted' });
    epic.level = 1;
    await epic.save();
    res.json({ message: 'Epic restored' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore epic' });
  }
};
