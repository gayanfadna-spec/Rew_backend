const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const verifyToken = require('../middleware/authMiddleware');

// Get Notifications for User
router.get('/', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Mark as Read
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating notification' });
    }
});

// Mark All as Read
router.put('/mark-all-read', verifyToken, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.userId, isRead: false }, { isRead: true });
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error marking all as read' });
    }
});

module.exports = router;
