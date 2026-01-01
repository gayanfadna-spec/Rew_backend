const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, system messages might not have a sender
    type: {
        type: String,
        enum: ['task_assigned', 'status_update', 'task_cancelled', 'subtask_update', 'due_soon'],
        required: true
    },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // Link to the specific task
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
