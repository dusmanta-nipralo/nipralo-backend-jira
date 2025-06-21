const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const { initSocket } = require('./utils/socket');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // wrap express app for socket.io
initSocket(server); // init socket.io

app.use(express.json());
app.use(cookieParser());

// Auth (register/login)
app.use('/api/auth', require('./routes/authRoutes'));

// Clients
app.use('/api/clients', require('./routes/clientRoutes'));

// Resources under clients
app.use('/api/resources', require('./routes/resourceRoutes'));

// Projects
app.use('/api/projects', require('./routes/projectRoutes'));

// Time Tracking
app.use('/api/timeTrackings', require('./routes/timeTrackingRoutes'));

// Team Members
app.use('/api/teamMembers', require('./routes/teamMember'));

// Milestones
app.use('/api/milestones', require('./routes/milestoneRoutes'));

// Backlogs
app.use('/api/backlogs', require('./routes/backlogRoutes'));

// Epics
app.use('/api/epics', require('./routes/epicRoutes'));

// Sprints
app.use('/api/sprints', require('./routes/sprintRoutes'));

app.use('/api/sprintactivities',require('./routes/sprintActivityRoutes'))

//task
app.use('/api/tasks',require('./routes/taskRoutes'));

//create status on board
app.use('/api/statusBoards',require('./routes/statusBoardRoutes'))
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
