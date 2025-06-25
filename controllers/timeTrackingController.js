// controllers/timeTrackingController.js
const Task = require('../models/task');
const Project = require('../models/project');
const TeamMember = require('../models/teamMember');
const { generateTeamViewCSV, generateTimeViewCSV } = require('../utils/csv');

// Helper: Calculate totals
function addProjectAndGrandTotals(summary) {
  const grandTotal = { hours: 0, minutes: 0 };

  for (const project in summary) {
    let projectMinutes = 0;
    for (const member in summary[project]) {
      const time = summary[project][member];
      projectMinutes += (time.hours || 0) * 60 + (time.minutes || 0);
    }
    summary[project]['Total'] = {
      hours: Math.floor(projectMinutes / 60),
      minutes: projectMinutes % 60
    };
    grandTotal.hours += Math.floor(projectMinutes / 60);
    grandTotal.minutes += projectMinutes % 60;
  }

  // Normalize grand total
  grandTotal.hours += Math.floor(grandTotal.minutes / 60);
  grandTotal.minutes = grandTotal.minutes % 60;
  summary['Total'] = grandTotal;

  return summary;
}

// Team view
exports.getTimeTrackingTeamView = async (req, res) => {
  try {
    const tasks = await Task.find({ level: 1 }).populate('projectId assignee');
    const summary = {};

    tasks.forEach(task => {
      if (!task.projectId || !task.assignee) return;

      const projectName = task.projectId.name;
      const memberName = task.assignee.name;
      const time = task.timeSpent || { hours: 0, minutes: 0 };

      if (!summary[projectName]) summary[projectName] = {};
      if (!summary[projectName][memberName]) summary[projectName][memberName] = { hours: 0, minutes: 0 };

      summary[projectName][memberName].hours += time.hours;
      summary[projectName][memberName].minutes += time.minutes;
    });

    // Normalize and add totals
    for (const project in summary) {
      for (const member in summary[project]) {
        const time = summary[project][member];
        if (time.minutes >= 60) {
          time.hours += Math.floor(time.minutes / 60);
          time.minutes %= 60;
        }
      }
    }

    const finalSummary = addProjectAndGrandTotals(summary);
    res.status(200).json({ success: true, data: finalSummary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error generating time tracking summary', error: err.message });
  }
};

// Time view
exports.getTimeTrackingTimeView = async (req, res) => {
  try {
    const tasks = await Task.find({ level: 1 }).populate('assignee');
    const summary = {};

    tasks.forEach(task => {
      if (!task.assignee) return;

      const date = new Date(task.updatedAt).toISOString().slice(0, 10);
      const memberName = task.assignee.name;
      const time = task.timeSpent || { hours: 0, minutes: 0 };

      if (!summary[date]) summary[date] = {};
      if (!summary[date][memberName]) summary[date][memberName] = { hours: 0, minutes: 0 };

      summary[date][memberName].hours += time.hours;
      summary[date][memberName].minutes += time.minutes;
    });

    for (const date in summary) {
      for (const member in summary[date]) {
        const time = summary[date][member];
        if (time.minutes >= 60) {
          time.hours += Math.floor(time.minutes / 60);
          time.minutes %= 60;
        }
      }
    }

    const finalSummary = addProjectAndGrandTotals(summary);
    res.status(200).json({ success: true, data: finalSummary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error generating time tracking time view', error: err.message });
  }
};

// Download team view CSV
exports.exportTeamViewCSV = async (req, res) => {
  try {
    const tasks = await Task.find({ level: 1 }).populate('projectId assignee');
    const summary = {};

    tasks.forEach(task => {
      if (!task.projectId || !task.assignee) return;
      const project = task.projectId.name;
      const member = task.assignee.name;
      const time = task.timeSpent || { hours: 0, minutes: 0 };

      if (!summary[project]) summary[project] = {};
      if (!summary[project][member]) summary[project][member] = { hours: 0, minutes: 0 };

      summary[project][member].hours += time.hours;
      summary[project][member].minutes += time.minutes;
    });

    for (const p in summary) {
      for (const m in summary[p]) {
        const t = summary[p][m];
        if (t.minutes >= 60) {
          t.hours += Math.floor(t.minutes / 60);
          t.minutes %= 60;
        }
      }
    }

    const finalSummary = addProjectAndGrandTotals(summary);
    const csv = generateTeamViewCSV(finalSummary);
    res.header('Content-Type', 'text/csv');
    res.attachment('team-view-report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'CSV export failed', error: err.message });
  }
};

// Download time view CSV
exports.exportTimeViewCSV = async (req, res) => {
  try {
    const tasks = await Task.find({ level: 1 }).populate('assignee');
    const summary = {};

    tasks.forEach(task => {
      if (!task.assignee) return;
      const date = new Date(task.updatedAt).toISOString().slice(0, 10);
      const member = task.assignee.name;
      const time = task.timeSpent || { hours: 0, minutes: 0 };

      if (!summary[date]) summary[date] = {};
      if (!summary[date][member]) summary[date][member] = { hours: 0, minutes: 0 };

      summary[date][member].hours += time.hours;
      summary[date][member].minutes += time.minutes;
    });

    for (const d in summary) {
      for (const m in summary[d]) {
        const t = summary[d][m];
        if (t.minutes >= 60) {
          t.hours += Math.floor(t.minutes / 60);
          t.minutes %= 60;
        }
      }
    }

    const finalSummary = addProjectAndGrandTotals(summary);
    const csv = generateTimeViewCSV(finalSummary);
    res.header('Content-Type', 'text/csv');
    res.attachment('time-view-report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'CSV export failed', error: err.message });
  }
};
