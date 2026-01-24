const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://admin:1234@cluster0.pwly5ds.mongodb.net/fadna?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        run();
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });

async function run() {
    try {
        console.log('Starting Repro...');

        // Find a user ID (sender/receiver)
        let user = await User.findOne();
        if (!user) {
            console.log('No user found, creating temp user...');
            user = await User.create({
                username: 'repro_user_' + Date.now(),
                password: 'password', // hashing skipped for repro speed if model allows
                name: 'Repro User',
                role: 'admin',
                email: 'repro@example.com'
            });
        }
        const userId = user._id;

        // Test 1: Create task with 1 subtask
        console.log('--- Test 1: 1 Subtask ---');
        const task1 = await Task.create({
            sender: userId,
            receiver: userId,
            title: 'Test Task 1',
            subtasks: [{ title: 'Sub 1' }]
        });

        // Fetch it back to be sure
        const fetchedTask1 = await Task.findById(task1._id);
        console.log('Created Task 1:', fetchedTask1.subtasks.length, 'subtasks');
        console.log('Subtasks:', JSON.stringify(fetchedTask1.subtasks));
        if (fetchedTask1.subtasks.length !== 1) console.error('FAIL: Expected 1 subtask');

        // Test 2: Create task with 2 subtasks
        console.log('--- Test 2: 2 Subtasks ---');
        const task2 = await Task.create({
            sender: userId,
            receiver: userId,
            title: 'Test Task 2',
            subtasks: [{ title: 'Sub A' }, { title: 'Sub B' }]
        });

        const fetchedTask2 = await Task.findById(task2._id);
        console.log('Created Task 2:', fetchedTask2.subtasks.length, 'subtasks');
        console.log('Subtasks:', JSON.stringify(fetchedTask2.subtasks));
        if (fetchedTask2.subtasks.length !== 2) console.error('FAIL: Expected 2 subtasks');

        // Cleanup
        await Task.deleteOne({ _id: task1._id });
        await Task.deleteOne({ _id: task2._id });

        console.log('Repro complete.');
    } catch (err) {
        console.error('Runtime error:', err);
    } finally {
        mongoose.connection.close();
    }
}
