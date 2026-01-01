const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed Admin
        const User = require('./models/User');
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 8);
            await User.create({
                username: 'admin',
                password: hashedPassword,
                name: 'System Admin',
                role: 'admin',
                email: 'admin@example.com'
            });
            console.log('Default Admin Account Created');
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
