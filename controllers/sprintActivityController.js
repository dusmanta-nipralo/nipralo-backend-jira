const Sprint = require('../models/sprint');
const Backlog = require('../models/backlog');
const { notifyUser } = require('../utils/socket');
const {sendMail} = require('../utils/nodemailer');

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

//&start sprint by sprintId
exports.startSprintBySprintId = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { startedBy, note } = req.body;

    //  Fix: Use Sprint model
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    if (sprint.status === 'active') return res.json({ message: 'Sprint already active' });

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
        subject: ` Sprint "${sprint.sprintName}" started`,
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
    res.json({ message: 'Error starting sprint', error: err.message });
  }
};

//& STOP Sprint using Sprint ID
exports.stopSprintBySprintId = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { stoppedBy, note } = req.body;

    // Step 1: Find sprint
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }
    // if (sprint.status !== 'active') {
    //   return res.status(400).json({ message: 'Sprint is not active' });
    // }

    // Step 2: Mark sprint as completed
   // sprint.status = 'completed';
    sprint.endedAt = new Date();
    sprint.stoppedBy = stoppedBy || null; // Optional tracking
    await sprint.save();

    // Step 3: Get related backlogs and assignees
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

    // Step 4: Notify each user
    for (const [userId, { name, email, backlogs }] of userMap.entries()) {
      const summary = {
        sprintName: sprint.sprintName,
        sprintGoal: sprint.sprintGoal,
        note,
        assignedBacklogs: backlogs
      };

      // Internal system notification (optional)
      notifyUser?.(userId, 'sprintStopped', summary);

      // Email notification
      await sendMail({
        to: email,
        subject: `Sprint "${sprint.sprintName}" completed`,
        text: `Hi ${name},\n\nThe sprint "${sprint.sprintName}" has ended.\nYou were assigned ${backlogs.length} backlog item(s).\n\nSprint Goal: ${sprint.sprintGoal || '—'}\nNote: ${note || '—'}\n\nThanks,\nProject Team`
      });
    }

    // Step 5: Respond
    res.status(200).json({
      message: 'Sprint stopped and notifications sent.',
      sprintId: sprint._id,
      backlogIds
    });
  } catch (err) {
    console.error('Error stopping sprint:', err);
    res.status(500).json({
      message: 'Error stopping sprint',
      error: err.message
    });
  }
};



exports.completeSprint = async (req, res) => {
  try {
    const { sprintId, moveTo, stoppedBy, note } = req.body;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });

    const allTasks = await Backlog.find({ sprintId: sprint._id, level: 1 });
    const incompleteTasks = allTasks.filter(task => task.status !== 'DONE');

    let nextSprint = null;
   if (moveTo === 'nextSprint') {
  if (req.body.nextSprintId) {
    nextSprint = await Sprint.findOne({ _id: req.body.nextSprintId, level: 1 });
  } else {
    nextSprint = await Sprint.findOne({
      projectId: sprint.projectId,
      startDate: { $gt: sprint.endDate },
      level: 1
    }).sort({ startDate: 1 });
  }

  if (!nextSprint) {
    return res.status(404).json({
      error: 'No next sprint found to move tasks to.',
      suggestion: 'Pass nextSprintId manually if needed.'
    });
  }
}


    // Move incomplete tasks
    await Promise.all(
      incompleteTasks.map(task => {
        task.sprintId = moveTo === 'nextSprint' && nextSprint ? nextSprint._id : null;
        return task.save();
      })
    );

    // Mark sprint as completed
    sprint.completedAt = new Date();
    sprint.endedAt = new Date();
    sprint.stoppedBy = stoppedBy || null;
    await sprint.save();

    // Email Notification (same as stopSprint)
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

      // System notify
      notifyUser?.(userId, 'sprintCompleted', summary);

      // Send email
      await sendMail({
        to: email,
        subject: `✅ Sprint "${sprint.sprintName}" completed`,
        text: `Hi ${name},\n\nThe sprint "${sprint.sprintName}" has been completed.\nYou were assigned ${backlogs.length} backlog item(s).\n\nSprint Goal: ${sprint.sprintGoal || '—'}\nNote: ${note || '—'}\n\nThanks,\nProject Team`
      });
    }

    res.status(200).json({
      message: 'Sprint completed successfully and notifications sent',
      totalTasks: allTasks.length,
      completedTasks: allTasks.length - incompleteTasks.length,
      incompleteTasks: incompleteTasks.length,
      movedTo: moveTo === 'nextSprint' && nextSprint ? 'Next Sprint' : 'Backlog',
      nextSprintId: nextSprint ? nextSprint._id : null,
      notifiedUsers: userMap.size
    });

  } catch (err) {
    console.error('Complete Sprint Error:', err);
    res.status(500).json({ error: 'Failed to complete sprint', details: err.message });
  }
};
