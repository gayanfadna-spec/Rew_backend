const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'To-Do' },
    created_at: { type: Date, default: Date.now },
    due_date: { type: Date, required: true },
    completed_at: { type: Date },
    reminder_sent: { type: Boolean, default: false },
    subtasks: [{
        title: String,
        status: { type: String, default: 'To-Do' },
        due_date: { type: Date },
        completed_at: { type: Date }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
