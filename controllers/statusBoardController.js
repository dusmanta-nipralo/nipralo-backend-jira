const StatusColumn = require('../models/statusBoard');

// Create
exports.createStatusColumn = async (req, res) => {
  try {
    const { name, color, boardId } = req.body;
    const column = new StatusColumn({ name, color, boardId, status: 1 });
    await column.save();
    res.status(201).json(column);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create column', details: err.message });
  }
};

// Get by board
exports.getColumnsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const columns = await StatusColumn.find({ boardId, status: 1 });
    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
};

// Get all active columns
exports.getAllColumns = async (req, res) => {
  try {
    const columns = await StatusColumn.find({ status: 1 });
    res.json(columns);
  } catch (err) {
    res.json({ error: 'Failed to fetch status columns' });
  }
};

// Update
exports.updateStatusColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const updated = await StatusColumn.findByIdAndUpdate(
      id,
      { name, color },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Column not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update column' });
  }
};

// Soft Delete
exports.softDeleteColumn = async (req, res) => {
  try {
    await StatusColumn.findByIdAndUpdate(req.params.id, { status: 5 });
    res.json({ message: 'Column deleted (soft)' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete column' });
  }
};

// Restore
exports.restoreColumn = async (req, res) => {
  try {
    await StatusColumn.findByIdAndUpdate(req.params.id, { status: 1 });
    res.json({ message: 'Column restored' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore column' });
  }
};
