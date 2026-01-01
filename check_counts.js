const mongoose = require('mongoose');
const Task = require('./models/Task');
const Notification = require('./models/Notification');
const dotenv = require('dotenv');

dotenv.config();

const checkCounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskmaster');
        console.log('Connected to DB');

        const taskCount = await Task.countDocuments();
        const notifCount = await Notification.countDocuments();

        const fs = require('fs');
        fs.writeFileSync('counts.txt', `Tasks: ${taskCount}\nNotifications: ${notifCount}`);
        console.log('Written to counts.txt');
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCounts();
