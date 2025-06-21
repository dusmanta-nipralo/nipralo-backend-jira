const {Resource} = require('../models/resource');
const Client = require('../models/client');

// Create resource and link to client
exports.createResource = async (req, res) => {
  try {
    const { clientId, name, date, status } = req.body;

    // Validate required fields
    if (!name) return res.status(400).json({ error: "Resource name is required." });

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: 'Client not found.' });

    // Create and save resource
    const resource = new Resource({ name, date, status, clientId });
    await resource.save();

    // ✅ Increment resourceCount instead of pushing
    await Client.findByIdAndUpdate(clientId, { $inc: { resourceCount: 1 } });

    res.status(201).json({
      message: 'Resource created and linked to client.',
      resource
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to create resource.',
      details: err.message
    });
  }
};

// Get all active resources
exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ level: 1 });
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources.' });
  }
};

exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, level: 1 });
    if (!resource) {
      // Try without level to see if the resource exists at all
      const exists = await Resource.findById(req.params.id);
      return res.status(404).json({
        error: 'Resource not found or not active.',
        hint: exists ? 'Resource exists but is not level 1.' : 'No resource with this ID.'
      });
    }

    res.status(200).json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resource.', details: err.message });
  }
};

// Update a resource
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate(
      { _id: req.params.id, level: 1 },
      req.body,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found or deleted.' });
    }

    res.status(200).json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource.', details: err.message });
  }
};

// Soft delete a resource
exports.softDeleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, level: 1 });
    if (!resource) return res.status(404).json({ message: 'Resource not found or already deleted' });

    resource.level = 5;
    await resource.save();

    res.json({ message: 'Resource soft deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resource', error: err.message });
  }
};

// Restore a soft-deleted resource
exports.restoreResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, level: 5 });
    if (!resource) return res.status(404).json({ message: 'Resource not found or not deleted' });

    resource.level = 1;
    await resource.save();

    res.json({ message: 'Resource restored' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to restore resource', error: err.message });
  }
};
