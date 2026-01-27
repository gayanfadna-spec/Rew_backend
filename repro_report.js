const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const connectDB = require('./db');

// Mock specific frontend filtering logic
async function runRepro() {
    await connectDB();

    console.log("Fetching users...");
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);
    users.forEach(u => console.log(`User: ${u.name} (${u._id})`));

    console.log("\nFetching tasks (type=all)...");
    const tasks = await Task.find({}).populate('sender', 'name').populate('receiver', 'name');
    console.log(`Found ${tasks.length} tasks.`);

    // Simulate backend transformation
    const data = tasks.map(t => ({
        ...t.toObject(),
        id: t._id.toString(),
        sender_name: t.sender ? t.sender.name : 'Unknown',
        receiver_name: t.receiver ? t.receiver.name : 'Unknown',
        sender_id: t.sender ? t.sender._id.toString() : null,
        receiver_id: t.receiver ? t.receiver._id.toString() : null
    }));

    // Frontend Logic Simulation
    console.log("\n--- Frontend Logic ---");

    // 1. activeUserIds Set
    const activeUserIds = new Set(users.map(u => u._id.toString()));
    console.log("Active User IDs Size:", activeUserIds.size);

    // 2. Filter deleted users
    const filteredData = data.filter(t => {
        const senderActive = activeUserIds.has(t.sender_id);
        const receiverActive = activeUserIds.has(t.receiver_id);

        if (!senderActive || !receiverActive) {
            console.log(`[Filtered Out] Task ${t.id} - SenderActive: ${senderActive} (${t.sender_id}), ReceiverActive: ${receiverActive} (${t.receiver_id})`);
        }
        return senderActive && receiverActive;
    });

    console.log(`\nTasks remaining after 'deleted users' filter: ${filteredData.length}`);

    if (filteredData.length === 0) {
        console.log("ISSUE REPRODUCED: All tasks filtered out.");
    } else {
        console.log("Tasks available for export:");
        filteredData.forEach(t => console.log(`- ${t.title} (Sender: ${t.sender_id}, Receiver: ${t.receiver_id})`));
    }

    process.exit(0);
}

runRepro();
