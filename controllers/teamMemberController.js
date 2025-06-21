const TeamMember = require('../models/teamMember');
const Project = require('../models/project');
const { sendProjectAssignmentEmail } = require('../utils/teamMemberMail');
// Create team member
exports.createTeamMember = async (req, res) => {
  try {
    const { projectId, name, email, role } = req.body;
    const member = new TeamMember({ projectId, name, email, role });
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create team member.', details: err.message });
  }
};

// Get active team members for a project
exports.getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find({ projectId: req.params.projectId, status: 1 })
      .populate('projectId', 'name description'); // populate project name, description only

    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get team members.', details: err.message });
  }
};

exports.getTeamMemberById = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id)
      .populate('projectId', 'name description'); // or populate all fields: .populate('projectId')

    if (!member || member.status === 5) {
      return res.status(404).json({ error: 'Team member not found.' });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get team member.', details: err.message });
  }
};

//^ Update team member details send mail after assigned


// Update team member
exports.updateTeamMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const updateData = req.body;

    const existingMember = await TeamMember.findById(memberId);

    if (!existingMember) {
      return res.status(404).json({ error: 'Team member not found.' });
    }

    const wasUnassigned = !existingMember.projectId;
    const nowAssigned = updateData.projectId && wasUnassigned;

    const updatedMember = await TeamMember.findByIdAndUpdate(memberId, updateData, {
      new: true,
      runValidators: true
    });

    // If projectId was just added, send email
    if (nowAssigned) {
      const project = await Project.findById(updateData.projectId);
      if (project) {
        await sendProjectAssignmentEmail(updatedMember.email, project.name);
      }
    }

    res.json({ message: 'Team member updated.', member: updatedMember });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update team member.', details: err.message });
  }
};


// Soft delete team member
exports.softDeleteTeamMember = async (req, res) => {
  try {
    const updated = await TeamMember.findByIdAndUpdate(req.params.id, { status: 5 }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Team member not found.' });
    res.json({ message: 'Member deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete.', details: err.message });
  }
};

// Restore soft-deleted team member_
exports.restoreTeamMember = async (req, res) => {
  try {
    const restored = await TeamMember.findByIdAndUpdate(req.params.id, { status: 1 }, { new: true });
    if (!restored) return res.status(404).json({ error: 'Team member not found.' });
    res.json({ message: 'Member restored.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore.', details: err.message });
  }
};
