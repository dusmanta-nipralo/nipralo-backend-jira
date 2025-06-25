const Backlog = require('../models/backlog');
const TeamMember = require('../models/teamMember');
const { sendBacklogAssignmentEmail } = require('../utils/nodemailer');
let {sendBacklogExplicit} = require('../utils/nodemailer')

exports.createBacklog = async (req, res) => {
  try {
    const { summary, description, projectId, sprintId, assignees,labels } = req.body;

    // Validate assignee project matches
    if (assignees && assignees.length > 0) {
      const memberIds = assignees.map(a => a.memberId);
      const members = await TeamMember.find({ _id: { $in: memberIds }, status: 1 });

      const mismatchedMembers = members.filter(member =>
        String(member.projectId) !== String(projectId)
      );
      console.log(mismatchedMembers)

      if (mismatchedMembers.length > 0) {
        const names = mismatchedMembers.map(m => m.name || m.email || m._id).join(', ');
        console.log(names)
        return res.status(400).json({
          error: `The following members are not assigned to this project: ${names}`
        });
      }
    }

    const backlog = new Backlog({
      summary,
      description,
      projectId,
      sprintId,
      assignees,
      labels
    });

    await backlog.save();

    // Optional: Send emails to assignees
    for (const assignee of assignees) {
      const member = await TeamMember.findById(assignee.memberId);
      if (member?.email) {
        await sendBacklogAssignmentEmail(member.email, summary);
      }
    }

    res.status(201).json({ message: 'Backlog created and notifications sent.', backlog });
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
    // Destructure assignees and summary from req.body
    const { assignees, summary } = req.body; 

    const backlog = await Backlog.findOneAndUpdate(
      { _id: req.params.id, level: 1 },
      req.body,
      { new: true, runValidators: true }
    );

    if (!backlog) {
      return res.status(404).json({ error: 'Backlog item not found' }); // Use 404 for not found
    }

    // Check if assignees exist and have elements before iterating
    if (assignees && assignees.length > 0) {
      let memberIds = assignees.map(a => a.memberId);
      let members = await TeamMember.find({ _id: { $in: memberIds }, status: 1 });

      for (let member of members) {
        if (member.email) {
          // Ensure sendBacklogExplicit is defined and handles async operations if needed
          await sendBacklogExplicit(member.email, summary); 
        }
      }
    }

    res.json({ message: "Backlog updated successfully and email sent if applicable", backlog }); // More accurate message
  } catch (err) {
    console.error("Error updating backlog:", err); // Log the error for debugging
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
