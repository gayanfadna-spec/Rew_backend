// const dotenv = require('dotenv');
// dotenv.config();

// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./db');

// connectDB();

// const app = express();
// const PORT = 5000;
// //newwwwwwwwwwwwww
// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));1
// app.use(express.json());

// // Basic Route
// app.get('/', (req, res) => {
//     res.send('Task System API Running');
// });

// const authRoutes = require('./routes/auth');
// const taskRoutes = require('./routes/tasks');
// const userRoutes = require('./routes/users');

// app.use('/api/auth', authRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/users', userRoutes);
// const notificationRoutes = require('./routes/notifications');
// app.use('/api/notifications', notificationRoutes);

// const initReminderService = require('./services/reminderService');
// initReminderService();

// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running on http://0.0.0.0:${PORT}`);
// });
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));

// Reminder service
require('./services/reminderService')();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

