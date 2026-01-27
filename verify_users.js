const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./db');

async function checkUsers() {
    await connectDB();

    console.log("Fetching all users...");
    const users = await User.find({});

    console.log(`Found ${users.length} users.`);
    users.forEach(u => {
        console.log(`User: ${u.username}, Role: ${u.role}, Dept: ${u.department}`);
    });

    process.exit(0);
}

checkUsers();
