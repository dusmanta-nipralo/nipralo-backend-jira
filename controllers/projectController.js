const Project = require('../models/project');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, lead, openTasks } = req.body;
    const project = new Project({ name, description, lead, openTasks });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project.', details: err.message });
  }
};

// Get all active projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, status: 1 });
    if (!project) return res.status(404).json({ error: 'Project not found or deleted.' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, status: 1 },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found or deleted.' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project.' });
  }
};

// PATCH /projects/:id/star - Toggle star/unstar
exports.toggleStarred = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    project.starred = !project.starred;
    await project.save();

    res.status(200).json({ message: `Project ${project.starred ? 'starred' : 'unstarred'}.`, project });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle star.', details: err.message });
  }
};


// Soft delete project
exports.softDeleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 5 },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.status(200).json({ message: 'Project soft deleted.', project });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
};

// Restore project
exports.restoreProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 1 },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.status(200).json({ message: 'Project restored.', project });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore project.' });
  }
};
