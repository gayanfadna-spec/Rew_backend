const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./db');

async function countMissing() {
    await connectDB();

    console.log("Checking for users with missing department...");
    const missing = await User.find({
        $or: [
            { department: { $exists: false } },
            { department: null },
            { department: '' }
        ]
    });

    console.log(`Users with missing department: ${missing.length}`);
    missing.forEach(u => console.log(`- ${u.username} (${u._id})`));

    const total = await User.countDocuments();
    console.log(`Total Users: ${total}`);

    process.exit(0);
}

countMissing();
