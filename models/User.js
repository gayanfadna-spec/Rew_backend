const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    department: { type: String, enum: ['Marketing', 'R&D', 'Production', 'Finance'] },
    name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
