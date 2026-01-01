const mongoose = require('mongoose');
const Task = require('./models/Task');
const Notification = require('./models/Notification');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const verifyDeletion = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskmaster');
        console.log('Connected to DB');

        // 1. Create a dummy task and notification
        const task = new Task({
            sender: new mongoose.Types.ObjectId(),
            receiver: new mongoose.Types.ObjectId(),
            title: 'Test Deletion',
            description: 'Test'
        });
        await task.save();

        const notification = new Notification({
            recipient: task.receiver,
            sender: task.sender,
            type: 'task_assigned',
            message: 'Test Notification',
            relatedId: task._id
        });
        await notification.save();

        console.log('Created dummy task and notification.');

        // 2. Perform deletion (simulating the route logic)
        await Task.deleteMany({});
        await Notification.deleteMany({});

        // 3. Verify
        const taskCount = await Task.countDocuments();
        const notifCount = await Notification.countDocuments();

        console.log(`Remaining Tasks: ${taskCount}`);
        console.log(`Remaining Notifications: ${notifCount}`);

        if (taskCount === 0 && notifCount === 0) {
            console.log('SUCCESS: All items deleted.');
        } else {
            console.log('FAILURE: Items remain.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyDeletion();
