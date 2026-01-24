const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
require('dotenv').config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fadna', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

async function run() {
    try {
        // Create a dummy user if needed
        let user = await User.findOne();
        if (!user) {
            user = await User.create({
                name: 'Test User',
                username: 'testuser',
                password: 'password',
                role: 'admin'
            });
        }

        // Test 1: Create task with 1 subtask
        console.log('--- Test 1: 1 Subtask ---');
        const task1 = await Task.create({
            sender: user._id,
            receiver: user._id,
            title: 'Test Task 1',
            subtasks: [{ title: 'Sub 1' }]
        });
        console.log('Created Task 1:', task1.subtasks.length, 'subtasks');
        if (task1.subtasks.length !== 1) console.error('FAIL: Expected 1 subtask');

        // Test 2: Create task with 2 subtasks
        console.log('--- Test 2: 2 Subtasks ---');
        const task2 = await Task.create({
            sender: user._id,
            receiver: user._id,
            title: 'Test Task 2',
            subtasks: [{ title: 'Sub A' }, { title: 'Sub B' }]
        });
        console.log('Created Task 2:', task2.subtasks.length, 'subtasks');
        if (task2.subtasks.length !== 2) console.error('FAIL: Expected 2 subtasks');

        // Cleanup
        await Task.deleteOne({ _id: task1._id });
        await Task.deleteOne({ _id: task2._id });

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

run();
