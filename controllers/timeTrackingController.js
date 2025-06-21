const TimeEntry = require('../models/timeTracking');
const Project = require('../models/project');
let {Parser} = require('json2csv')

//create time  entry
exports.addTimeEntry = async (req, res) => {
  try {
    const { projectId, member, date, hours } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const timeEntry = new TimeEntry({
      project: projectId,
      member,
      date,
      hours,
      status: 1
    });

    await timeEntry.save();
    res.status(201).json(timeEntry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add time entry', details: err.message });
  }
};

//get all
exports.getTimeSummary = async (req, res) => {
  try {
    const { view = 'team' } = req.query;

    const groupField = view === 'time' ? '$date' : '$member';

    const summary = await TimeEntry.aggregate([
      { $match: { status: 1 } },
      {
        $group: {
          _id: { project: '$project', key: groupField },
          totalHours: { $sum: '$hours' }
        }
      },
      {
        $group: {
          _id: '$_id.project',
          entries: {
            $push: {
              key: '$_id.key',
              totalHours: '$totalHours'
            }
          },
          totalHoursForProject: { $sum: '$totalHours' }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $project: {
          projectName: '$project.name',
          entries: 1,
          totalHoursForProject: 1
        }
      }
    ]);
 console.log(summary)
    const grandTotalHours = summary.reduce((acc, item) => acc + item.totalHoursForProject, 0);
console.log(grandTotalHours)
    res.status(200).json({ summary, grandTotalHours });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch time summary.', details: err.message });
  }
};

//export csv
exports.exportTimeSummaryCSV = async (req, res) => {
  try {
    const { view = 'team' } = req.query;

    const rawData = await TimeEntry.aggregate([
      { $match: { status: 1 } },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      { $unwind: '$projectInfo' },
      {
        $project: {
          Project: '$projectInfo.name',
          Member: '$member',
          Date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          Hours: '$hours'
        }
      }
    ]);

    const grandTotal = rawData.reduce((sum, r) => sum + r.Hours, 0);
    rawData.push({ Project: 'Total', Member: '', Date: '', Hours: grandTotal });

    const fields = view === 'time'
      ? ['Project', 'Date', 'Hours']
      : ['Project', 'Member', 'Hours'];

    const data = view === 'time'
      ? rawData.map(r => ({
          Project: r.Project,
          Date: r.Date,
          Hours: r.Hours
        }))
      : rawData.map(r => ({
          Project: r.Project,
          Member: r.Member,
          Hours: r.Hours
        }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`project_time_summary_${view}.csv`);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV.', details: err.message });
  }
};
