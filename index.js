const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

connectDB();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Basic Route11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
app.get('/', (req, res) => {
    res.send('Task System API Running');
});

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

const initReminderService = require('./services/reminderService');
initReminderService();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
