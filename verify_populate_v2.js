const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const connectDB = require('./db');

async function checkPopulate() {
    await connectDB();

    console.log("Fetching up to 5 tasks...");
    const tasks = await Task.find().limit(5).populate('sender', 'name department').populate('receiver', 'name department');

    if (tasks.length > 0) {
        tasks.forEach((task, index) => {
            console.log(`\nTask ${index + 1}: ${task.title}`);
            const sName = task.sender ? task.sender.name : 'Unknown';
            const sDept = task.sender ? task.sender.department : 'Unknown';
            const rName = task.receiver ? task.receiver.name : 'Unknown';
            const rDept = task.receiver ? task.receiver.department : 'Unknown';

            console.log(`  Sender: ${sName} (Dept: ${sDept})`);
            console.log(`  Receiver: ${rName} (Dept: ${rDept})`);

            if (sDept === undefined || rDept === undefined) {
                console.log("  [ALERT] Department is UNDEFINED in Mongoose object!");
                console.log("  Sender Obj:", task.sender);
            }
        });
    } else {
        console.log("No tasks found in DB.");
    }

    process.exit(0);
}

checkPopulate();
