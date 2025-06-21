const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());

//&authentication routes
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/clients',require('./routes/clientRoutes'))

app.use('/api/resources',require('./routes/resourceRoutes'))

app.use('/api/projects',require('./routes/projectRoutes'))

app.use('/api/timeTrackings', require('./routes/timeTrackingRoutes'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));