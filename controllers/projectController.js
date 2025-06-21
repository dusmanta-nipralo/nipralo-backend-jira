const Project = require('../models/project');
const TeamMember = require('../models/teamMember');
const { sendProjectCreationEmail } = require('../utils/nodemailerProject');

exports.createProject = async (req, res) => {
  try {
    const { name, description, lead } = req.body;

    const project = new Project({ name, description, lead });
    await project.save();

    // 🔍 Find team members not yet assigned to any project
    const unassignedMembers = await TeamMember.find({ 
      $or: [ { projectId: { $exists: false } }, { projectId: null } ],
      status: 1
    });

    const emails = unassignedMembers.map(m => m.email);

    console.log("📢 Unassigned team members:", emails);

    // 📬 Send project creation email to them
    if (emails.length > 0) {
      await sendProjectCreationEmail(emails, name);
    }

    res.status(201).json({
      message: 'Project created',
      project,
      emailSentTo: emails
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project', details: err.message });
  }
};


// Get all active projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 1 });
    res.json(projects);
  } catch (err) {
    res.json({ error: 'Failed to fetch projects.' });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, status: 1 });
    if (!project) return res.json({ error: 'Project not found or deleted.' });
    res.json(project);
  } catch (err) {
    res.json({ error: 'Failed to fetch project.' });
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
    if (!project) return res.json({ error: 'Project not found or deleted.' });
    res.json(project);
  } catch (err) {
    res.json({ error: 'Failed to update project.' });
  }
};

// PATCH /projects/:id/star - Toggle star/unstar
exports.toggleStarred = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.json({ error: 'Project not found.' });

    project.starred = !project.starred;
    await project.save();

    res.json({ message: `Project ${project.starred ? 'starred' : 'unstarred'}.`, project });
  } catch (err) {
    res.json({ error: 'Failed to toggle star.', details: err.message });
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
    res.json({ message: 'Project deleted.'});
  } catch (err) {
    res.json({ error: 'Failed to delete project.' });
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
    res.json({ message: 'Project restored.'});
  } catch (err) {
    res.json({ error: 'Failed to restore project.' });
  }
};
