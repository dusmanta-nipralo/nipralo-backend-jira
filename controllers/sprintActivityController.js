const Sprint = require('../models/sprint');
const Backlog = require('../models/backlog');
const { notifyUser } = require('../utils/socket');
const sendMail = require('../utils/nodemailer');

//&start sprint by backlog id
exports.startSprintByBacklog = async (req, res) => {
  try {
    const { backlogId } = req.params;
    const { startedBy, note } = req.body;

    const backlog = await Backlog.findById(backlogId);
    if (!backlog || !backlog.sprintId) {
      return res.status(404).json({ message: 'Sprint ID not found' });
    }

    const sprint = await Sprint.findById(backlog.sprintId);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    if (sprint.status === 'active') return res.status(400).json({ message: 'Sprint already active' });

    sprint.status = 'active';
    sprint.startedAt = new Date();
    await sprint.save();

    const backlogs = await Backlog.find({ sprintId: sprint._id }).populate('assignees.memberId');
    const userMap = new Map();

    for (const b of backlogs) {
      for (const assignee of b.assignees || []) {
        const member = assignee.memberId;
        if (!member || !member.email) continue;

        const userId = member._id.toString();
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            name: member.name,
            email: member.email,
            backlogs: []
          });
        }
        userMap.get(userId).backlogs.push({
          summary: b.summary,
          estimate: b.estimate
        });
      }
    }

    for (const [userId, { name, email, backlogs }] of userMap.entries()) {
    const summary = {
  sprintName: sprint.sprintName,
  sprintGoal: sprint.sprintGoal,
  note,
  assignedBacklogs: backlogs
};

notifyUser(userId, 'sprintStarted', summary);


      notifyUser(userId, 'sprintStarted', summary);

      await sendMail({
        to: email,
        subject: `🚀 Sprint "${sprint.sprintName}" started`,
        text: `Hi ${name},\n\nThe sprint "${sprint.sprintName}" has started.\nGoal: ${sprint.sprintGoal}\nYou have ${backlogs.length} assigned items.\n\nNote: ${note || '—'}\n\nGood luck!`
      });
    }

    res.status(200).json({ message: 'Sprint started and notifications sent.', sprintId: sprint._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error starting sprint', error: err.message });
  }
};

//&stop sprint by backlog id
exports.stopSprintByBacklog = async (req, res) => {
  try {
    const { backlogId } = req.params;
    const { stoppedBy, note } = req.body;

    const backlog = await Backlog.findById(backlogId);
    if (!backlog || !backlog.sprintId) {
      return res.status(404).json({ message: 'Backlog or Sprint ID not found' });
    }

    const sprint = await Sprint.findById(backlog.sprintId);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    if (sprint.status !== 'active') return res.status(400).json({ message: 'Sprint is not active' });

    sprint.status = 'completed';
    sprint.endedAt = new Date();
    await sprint.save();

    const backlogs = await Backlog.find({ sprintId: sprint._id }).populate('assignees.memberId');
    const userMap = new Map();

    for (const b of backlogs) {
      for (const assignee of b.assignees || []) {
        const member = assignee.memberId;
        if (!member || !member.email) continue;

        const userId = member._id.toString();
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            name: member.name,
            email: member.email,
            backlogs: []
          });
        }
        userMap.get(userId).backlogs.push({
          summary: b.summary,
          estimate: b.estimate
        });
      }
    }

    for (const [userId, { name, email, backlogs }] of userMap.entries()) {
      const summary = {
        sprintName: sprint.name,
        goal: sprint.goal,
        note,
        assignedBacklogs: backlogs
      };

      notifyUser(userId, 'sprintStopped', summary);

      await sendMail({
        to: email,
        subject: `🏁 Sprint "${sprint.name}" completed`,
        text: `Hi ${name},\n\nThe sprint "${sprint.name}" has ended.\nYou were assigned ${backlogs.length} items.\n\nNote: ${note || '—'}\n\nThanks!`
      });
    }

    res.status(200).json({ message: 'Sprint stopped and notifications sent.', sprintId: sprint._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error stopping sprint', error: err.message });
  }
};

exports.startSprintBySprintId = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { startedBy, note } = req.body;

    // ✅ Fix: Use Sprint model
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    if (sprint.status === 'active') return res.status(400).json({ message: 'Sprint already active' });

    sprint.status = 'active';
    sprint.startedAt = new Date();
    await sprint.save();

    const backlogs = await Backlog.find({ sprintId }).populate('assignees.memberId');
    const userMap = new Map();
    const backlogIds = [];

    for (const b of backlogs) {
      backlogIds.push(b._id);
      for (const assignee of b.assignees || []) {
        const member = assignee.memberId;
        if (!member || !member.email) continue;

        const userId = member._id.toString();
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            name: member.name,
            email: member.email,
            backlogs: []
          });
        }
        userMap.get(userId).backlogs.push({
          summary: b.summary,
          estimate: b.estimate
        });
      }
    }

    for (const [userId, { name, email, backlogs }] of userMap.entries()) {
      const summary = {
        sprintName: sprint.sprintName,
        sprintGoal: sprint.sprintGoal,
        note,
        assignedBacklogs: backlogs
      };

      notifyUser(userId, 'sprintStarted', summary);

      await sendMail({
        to: email,
        subject: `🚀 Sprint "${sprint.sprintName}" started`,
        text: `Hi ${name},\n\nThe sprint "${sprint.sprintName}" has started.\nGoal: ${sprint.sprintGoal}\nYou have ${backlogs.length} assigned items.\n\nNote: ${note || '—'}\n\nGood luck!`
      });
    }

    res.status(200).json({
      message: 'Sprint started and notifications sent.',
      sprintId: sprint._id,
      backlogIds
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error starting sprint', error: err.message });
  }
};


//& STOP Sprint using Sprint ID
exports.stopSprintBySprintId = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { stoppedBy, note } = req.body;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    if (sprint.status !== 'active') return res.status(400).json({ message: 'Sprint is not active' });

    sprint.status = 'completed';
    sprint.endedAt = new Date();
    await sprint.save();

    const backlogs = await Backlog.find({ sprintId }).populate('assignees.memberId');
    const userMap = new Map();
    const backlogIds = [];

    for (const b of backlogs) {
      backlogIds.push(b._id);
      for (const assignee of b.assignees || []) {
        const member = assignee.memberId;
        if (!member || !member.email) continue;

        const userId = member._id.toString();
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            name: member.name,
            email: member.email,
            backlogs: []
          });
        }
        userMap.get(userId).backlogs.push({
          summary: b.summary,
          estimate: b.estimate
        });
      }
    }

    for (const [userId, { name, email, backlogs }] of userMap.entries()) {
      const summary = {
        sprintName: sprint.sprintName,
        sprintGoal: sprint.sprintGoal,
        note,
        assignedBacklogs: backlogs
      };

      notifyUser(userId, 'sprintStopped', summary);

      await sendMail({
        to: email,
        subject: `🏁 Sprint "${sprint.sprintName}" completed`,
        text: `Hi ${name},\n\nThe sprint "${sprint.sprintName}" has ended.\nYou were assigned ${backlogs.length} items.\n\nNote: ${note || '—'}\n\nThanks!`
      });
    }

    res.status(200).json({
      message: 'Sprint stopped and notifications sent.',
      sprintId: sprint._id,
      backlogIds
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error stopping sprint', error: err.message });
  }
};

