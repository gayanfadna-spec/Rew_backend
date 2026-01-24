const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Create a dummy task
        // We need valid user IDs. Assuming there are some users.
        const user = await User.findOne();
        if (!user) {
            console.log('No users found to Create task');
            process.exit(1);
        }

        const task = await Task.create({
            sender: user._id,
            receiver: user._id,
            title: 'Test Task',
            due_date: new Date(),
            subtasks: [{ title: 'Subtask 1', due_date: new Date() }]
        });
        console.log('Created task:', task._id);

        // Update it
        const completedDate = new Date();
        const updatedSubtasks = [{
            ...task.subtasks[0].toObject(),
            status: 'Completed',
            completed_at: completedDate
        }];

        const updated = await Task.findByIdAndUpdate(task._id, { subtasks: updatedSubtasks }, { new: true });

        console.log('Updated Subtask:', updated.subtasks[0]);
        if (updated.subtasks[0].completed_at) {
            console.log('SUCCESS: completed_at persisted!');
        } else {
            console.log('FAILURE: completed_at missing!');
        }

        // Cleanup
        await Task.findByIdAndDelete(task._id);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

run();
