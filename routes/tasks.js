const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// Get Tasks
router.get('/', verifyToken, async (req, res) => {
    try {
        const { type, searchUser, searchDate, searchTask } = req.query;
        const userId = req.userId;
        const userRole = req.userRole;

        let query = {};

        // Base Type Filter
        if (type === 'sent') {
            query.sender = userId;
        } else if (type === 'all' && userRole === 'admin') {
            // No base filter
        } else {
            // Default: received
            query.receiver = userId;
        }

        // Search Task Content
        if (searchTask) {
            query.$or = [
                { title: { $regex: searchTask, $options: 'i' } },
                { description: { $regex: searchTask, $options: 'i' } }
            ];
        }

        // Search Date
        if (searchDate) {
            // Assume YYYY-MM-DD
            const start = new Date(searchDate);
            const end = new Date(searchDate);
            end.setDate(end.getDate() + 1);
            query.due_date = { $gte: start, $lt: end };
        }

        // Search User
        if (searchUser) {
            const users = await User.find({ name: { $regex: searchUser, $options: 'i' } }).select('_id');
            const userIds = users.map(u => u._id);

            let userQuery = {};

            if (type === 'sent') {
                userQuery.receiver = { $in: userIds };
            } else if (type === 'all' && userRole === 'admin') {
                userQuery.$or = [
                    { sender: { $in: userIds } },
                    { receiver: { $in: userIds } }
                ];
            } else {
                userQuery.sender = { $in: userIds };
            }

            // Combine with existing query
            if (query.$or && userQuery.$or) {
                // If both have $or, we must use $and
                query = {
                    $and: [
                        { ...query }, // Includes existing sender/receiver/due_date and $or
                        { $or: userQuery.$or }
                    ]
                };
            } else {
                Object.assign(query, userQuery);
            }
        }

        const tasks = await Task.find(query)
            .populate('sender', 'name')
            .populate('receiver', 'name')
            .sort({ created_at: -1 });

        // Transform response to match previous structure if needed
        // Previous structure had sender_name, receiver_name.
        // Mongoose populate gives us sender: { name: ... }
        // We can map it or adjust frontend. 
        // To be safe and minimize frontend changes, let's map it.
        const responseByTask = tasks.map(t => ({
            ...t.toObject(),
            id: t._id, // Map _id to id
            sender_name: t.sender ? t.sender.name : 'Unknown',
            receiver_name: t.receiver ? t.receiver.name : 'Unknown',
            sender_id: t.sender ? t.sender._id : null,
            receiver_id: t.receiver ? t.receiver._id : null
        }));

        res.json(responseByTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});

// Create Task
router.post('/', verifyToken, async (req, res) => {
    try {
        const { receiver_id, title, description, due_date, subtasks } = req.body;
        const sender_id = req.userId;

        const task = await Task.create({
            sender: sender_id,
            receiver: receiver_id,
            title,
            description,
            due_date,
            subtasks: subtasks || []
        });

        // Create Notification for Receiver
        if (sender_id !== receiver_id) { // Avoid self-notification if self-assigned
            await Notification.create({
                recipient: receiver_id,
                sender: sender_id,
                type: 'task_assigned',
                message: `New task assigned: ${title}`,
                relatedId: task._id
            });
        }

        res.status(201).json({ id: task._id, message: 'Task created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating task' });
    }
});

// Update Task
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status, subtasks } = req.body;
        const userId = req.userId;
        const userRole = req.userRole;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        // Permission Logic
        if (status === 'Canceled') {
            // Check if user is sender or admin using string comparison for IDs
            if (task.sender.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'Only the sender can cancel this task' });
            }
        }

        const updateData = {};
        if (status) {
            updateData.status = status;
            if (status === 'Completed') {
                updateData.completed_at = new Date();
            } else {
                updateData.completed_at = null;
            }
        }
        if (subtasks) {
            updateData.subtasks = subtasks;
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });

        // Notification Logic
        if (status) {
            let notificationRecipient = null;
            let message = '';

            if (userId === task.sender.toString()) {
                // Sender updated status (e.g., Cancelled)
                if (status === 'Canceled') {
                    notificationRecipient = task.receiver;
                    message = `Task "${task.title}" was canceled by sender.`;
                }
            } else if (userId === task.receiver.toString()) {
                // Receiver updated status
                notificationRecipient = task.sender;
                message = `Task "${task.title}" status updated to ${status}.`;
            }

            if (notificationRecipient) {
                await Notification.create({
                    recipient: notificationRecipient,
                    sender: userId,
                    type: status === 'Canceled' ? 'task_cancelled' : 'status_update',
                    message: message,
                    relatedId: task._id
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating task' });
    }
});

// Delete All Tasks (Admin Only, requires re-verification)
router.post('/delete-all', verifyToken, async (req, res) => {
    try {
        console.log("POST /delete-all request received");
        const { username, password } = req.body;
        const requesterRole = req.userRole;

        if (requesterRole !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required for verification' });
        }

        // Verify credentials
        const bcrypt = require('bcryptjs');
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid verification credentials' });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ error: 'Invalid verification password' });
        }

        if (user.role !== 'admin') {
            console.log('[DELETE-ALL] User is not admin');
            return res.status(403).json({ error: 'Verification account must be an admin' });
        }

        // Proceed to delete all tasks
        const result = await Task.deleteMany({});
        console.log(`[DELETE-ALL] Tasks deleted: ${result.deletedCount}`);

        // Notifications are intentionally preserved when deleting all tasks

        console.log(`All tasks deleted by ${username}. Count: ${result.deletedCount}`);
        res.json({ message: 'All tasks deleted successfully' });

    } catch (err) {
        console.error("Error in DELETE /all:", err);
        res.status(500).json({ error: 'Error deleting all tasks' });
    }
});

module.exports = router;
