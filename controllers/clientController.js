const Client = require('../models/client');
const { Resource } = require('../models/resource'); //  Destructured as you wrote

// ======================
// CLIENT CRUD OPERATIONS
// ======================
// POST /clients - Create a new client
exports.createClient = async (req, res) => {
  try {
    const { name, project, contact, resources = [], summary, status } = req.body;
    // Check if client already exists
    const existingClient = await Client.findOne({ name, project });
    if (existingClient) {
      return res.json({ error: 'Client with this name and project already exists.' });
    }
    // Create client with resource count
    const client = new Client({
      name,project,contact,summary,
      status: status || 1,
      resourceCount: resources.length
    });

    await client.save();

    // Save resources with clientId reference
    let insertedResources = [];
    if (Array.isArray(resources) && resources.length > 0) {
      const resourceDocs = resources.map(r => ({
        ...r,
        clientId: client._id
      }));
      insertedResources = await Resource.insertMany(resourceDocs);
    }

    res.json({
      message: 'Client created successfully',
      client: {
        ...client.toObject(),
        resources: insertedResources // only for response
      }
    });
  } catch (err) {
    res.json({ error: 'Failed to create client.', details: err.message });
  }
};

// GET /clients - Get all active clients (not soft-deleted)
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ status: 1 });
    res.json(clients);
  } catch (err) {
    res.json({ error: 'Failed to fetch clients.' });
  }
};

// GET /clients/:id - Get client by ID (if active)
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, status: 1 });
    if (!client) return res.json({ error: 'Client not found or deleted.' });

    // Optionally fetch resource count from DB if you want it to be dynamic
    const resourceCount = await Resource.countDocuments({ clientId: client._id });

    res.json({
      ...client.toObject(),
      resourceCount
    });
  } catch (err) {
    res.json({ error: 'Failed to fetch client.' });
  }
};

// PUT /clients/:id - Update a client
exports.updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id, status: 1 },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedClient) return res.json({ error: 'Client not found or deleted.' });

    res.json(updatedClient);
  } catch (err) {
    res.json({ error: 'Failed to update client.' });
  }
};

// PATCH /clients/:id/delete - Soft delete client
exports.softDeleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status: 5 },
      { new: true }
    );
    if (!client) return res.json({ error: 'Client not found.' });

    res.json({ message: 'Client deleted.' });
  } catch (err) {
    res.json({ error: 'Failed to delete client.' });
  }
};

// PATCH /clients/:id/restore - Restore soft-deleted client
exports.restoreClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status: 1 },
      { new: true }
    );
    if (!client) return res.json({ error: 'Client not found.' });

    res.json({ message: 'Client restored.' });
  } catch (err) {
    res.json({ error: 'Failed to restore client.' });
  }
};
