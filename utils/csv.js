const { Parser } = require('json2csv');
let Sprint = require("../models/sprint")

function convertTimeToString(time) {
  if (!time) return '-';
  const { hours = 0, minutes = 0 } = time;
  return `${hours} h ${minutes} m`;
}

// ✅ 1. Team View CSV
function generateTeamViewCSV(summary) {
  const projectNames = Object.keys(summary);
  const allMembers = new Set();

  projectNames.forEach(project => {
    Object.keys(summary[project]).forEach(member => allMembers.add(member));
  });

  const memberList = Array.from(allMembers);
  const fields = ['Project', ...memberList, 'Total'];
  const data = [];

  projectNames.forEach(project => {
    const row = { Project: project };
    let totalMinutes = 0;

    memberList.forEach(member => {
      const time = summary[project][member];
      row[member] = convertTimeToString(time);

      if (time) totalMinutes += (time.hours * 60) + time.minutes;
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemMinutes = totalMinutes % 60;
    row['Total'] = `${totalHours} h ${totalRemMinutes} m`;
    data.push(row);
  });

  const totalRow = { Project: 'Total' };
  memberList.forEach(member => {
    let minutes = 0;
    projectNames.forEach(project => {
      const t = summary[project][member];
      if (t) minutes += (t.hours * 60) + t.minutes;
    });
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    totalRow[member] = `${h} h ${m} m`;
  });

  const grandTotalMinutes = Object.values(totalRow)
    .filter(val => typeof val === 'string' && val.includes('h'))
    .reduce((acc, timeStr) => {
      const [h, m] = timeStr.split('h').map(s => parseInt(s.trim()));
      return acc + h * 60 + (m || 0);
    }, 0);

  totalRow['Total'] = `${Math.floor(grandTotalMinutes / 60)} h ${grandTotalMinutes % 60} m`;

  data.push(totalRow);

  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(data);
}

// ✅ 2. Time View CSV
function generateTimeViewCSV(summaryByDate) {
  const dates = Object.keys(summaryByDate).sort();
  const allMembers = new Set();

  dates.forEach(date => {
    Object.keys(summaryByDate[date]).forEach(member => allMembers.add(member));
  });

  const memberList = Array.from(allMembers);
  const fields = ['Date', ...memberList, 'Total'];
  const data = [];

  dates.forEach(date => {
    const row = { Date: date };
    let totalMinutes = 0;

    memberList.forEach(member => {
      const time = summaryByDate[date][member];
      if (time) {
        const minutes = time.hours * 60 + time.minutes;
        row[member] = `${time.hours} h ${time.minutes} m`;
        totalMinutes += minutes;
      } else {
        row[member] = '-';
      }
    });

    row.Total = `${Math.floor(totalMinutes / 60)} h ${totalMinutes % 60} m`;
    data.push(row);
  });

  const totalRow = { Date: 'Total' };
  let grandTotal = 0;

  memberList.forEach(member => {
    let totalMinutes = 0;
    dates.forEach(date => {
      const time = summaryByDate[date][member];
      if (time) totalMinutes += time.hours * 60 + time.minutes;
    });
    totalRow[member] = `${Math.floor(totalMinutes / 60)} h ${totalMinutes % 60} m`;
    grandTotal += totalMinutes;
  });

  totalRow.Total = `${Math.floor(grandTotal / 60)} h ${grandTotal % 60} m`;
  data.push(totalRow);

  const parser = new Parser({ fields });
  return parser.parse(data);
}

async function generateWorkDataCSV(tasks, setting, backlog) {
  const sprint = await Sprint.findOne().lean(); // Awaited before mapping
  const sprintName = sprint?.sprintName || 'No Sprint';

  const data = tasks.map(task => ({
    key: setting?.project_key || '',
    type: task.type,
    summary: backlog?.summary || '',
    status: task.status,
    assignees: Array.isArray(backlog?.assignees)
      ? backlog.assignees
          .filter(a => a.memberId)
          .map(a => ({
            name: a.memberId.name,
          }))
      : [],
    reporter: task.assignee?.name,
    priority: task.priority,
    dueDate: task.dueDate,
    estimate: `${task.timeSpent?.hours || 0}h ${task.timeSpent?.minutes || 0}m`,
    sprintName,
    description: task.projectId?.description || ''
  }));

  const fields = [
    'key', 'type', 'summary', 'status', 'assignees', 'reporter',
    'priority', 'dueDate', 'estimate', 'sprintName', 'description'
  ];

  const parser = new Parser({ fields });
  return parser.parse(data);
}


module.exports = {
  generateTeamViewCSV,
  generateTimeViewCSV,
  generateWorkDataCSV
};
