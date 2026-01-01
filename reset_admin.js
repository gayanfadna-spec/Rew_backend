const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/taskmaster').then(async () => {
    try {
        const hashedPassword = await bcrypt.hash('admin', 8);
        const res = await User.updateOne({ role: 'admin' }, { password: hashedPassword, username: 'admin' });
        console.log('Update result:', res);
        console.log('Admin password reset to "admin"');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
