const Project = require('../models/project');
const Task = require('../models/task');
const TeamMember = require('../models/teamMember');
const { sendProjectCreationEmail } = require('../utils/nodemailer');

// Helper to enrich with openTasks
const enrichProjectsWithOpenTasks = async (projects) => {
  return Promise.all(
    projects.map(async (project) => {
      const openTasks = await Task.countDocuments({
        projectId: project._id,
        status: 'To Do',
        level: 1
      });
      const projectObj = project.toObject();
      projectObj.openTasks = openTasks;
      return projectObj;
    })
  );
};

// Create Project
exports.createProject = async (req, res) => {
  try {
    const { name, description, lead, startDate, endDate } = req.body;
    const project = new Project({ name, description, lead, startDate, endDate });
    await project.save();

    const unassignedMembers = await TeamMember.find({
      $or: [{ projectId: { $exists: false } }, { projectId: null }],
      status: 1
    });

    const emails = unassignedMembers.map(m => m.email);
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

// Get all projects with dynamic open task count
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 1 });
    const enriched = await enrichProjectsWithOpenTasks(projects);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects.', details: err.message });
  }
};

// Get one project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, status: 1 });
    if (!project) return res.status(404).json({ error: 'Project not found or deleted.' });

    const openTasks = await Task.countDocuments({
      projectId: project._id,
      status: 'To Do',
      level: 1
    });

    const projectObj = project.toObject();
    projectObj.openTasks = openTasks;

    res.json(projectObj);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
};

// Update
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, status: 1 },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found or deleted.' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project.' });
  }
};

// Star/unstar
exports.toggleStarred = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    project.starred = !project.starred;
    await project.save();

    res.json({ message: `Project ${project.starred ? 'starred' : 'unstarred'}.`, project });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle star.', details: err.message });
  }
};

// Soft delete
exports.softDeleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 5 },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
};

// Restore
exports.restoreProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 1 },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project restored.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore project.' });
  }
};

// Get only starred projects with openTasks count
exports.getStarredProjects = async (req, res) => {
  try {
    const starredProjects = await Project.find({ status: 1, starred: true });
    const enriched = await enrichProjectsWithOpenTasks(starredProjects);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch starred projects.', details: err.message });
  }
};

// Progress bar
exports.getProjectProgress = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const today = new Date();

    const totalDuration = end - start;
    const elapsed = today - start;

    let progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100); // Clamp 0-100

    res.json({
      projectId: project._id,
      name: project.name,
      progress: Math.round(progress),
      startDate: start,
      endDate: end,
      today
    });

  } catch (error) {
    res.status(500).json({ message: "Error calculating progress", error });
  }
};
