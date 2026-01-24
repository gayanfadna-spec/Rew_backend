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
        console.log('Starting Verification...');

        let user = await User.findOne();
        if (!user) {
            console.log('No user found, creating temp user...');
            user = await User.create({
                username: 'verify_user_' + Date.now(),
                password: 'password',
                name: 'Verify User',
                role: 'admin',
                email: 'verify@example.com'
            });
        }
        const userId = user._id;

        // Test: Create task with subtask having due date
        console.log('--- Test: Subtask with Due Date ---');
        const dueDate = new Date('2025-12-25');
        const task = await Task.create({
            sender: userId,
            receiver: userId,
            title: 'Test Task with Subtask Date',
            subtasks: [
                { title: 'Sub 1', due_date: dueDate },
                { title: 'Sub 2' } // No date
            ]
        });

        const fetchedTask = await Task.findById(task._id);
        console.log('Subtasks:', JSON.stringify(fetchedTask.subtasks));

        const sub1 = fetchedTask.subtasks[0];
        const sub2 = fetchedTask.subtasks[1];

        if (sub1.due_date && new Date(sub1.due_date).getTime() === dueDate.getTime()) {
            console.log('PASS: Subtask 1 has correct due date.');
        } else {
            console.error('FAIL: Subtask 1 missing or incorrect due date.', sub1.due_date);
        }

        if (!sub2.due_date) {
            console.log('PASS: Subtask 2 has no due date as expected.');
        } else {
            console.error('FAIL: Subtask 2 should not have a due date.', sub2.due_date);
        }

        // Cleanup
        await Task.deleteOne({ _id: task._id });

        console.log('Verification complete.');
    } catch (err) {
        console.error('Runtime error:', err);
    } finally {
        mongoose.connection.close();
    }
}
