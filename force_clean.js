const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const dotenv = require('dotenv');

dotenv.config();

const clean = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskmaster');
        console.log('Connected to DB');

        const res = await Notification.deleteMany({});
        console.log(`Deleted ${res.deletedCount} notifications.`);

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clean();
