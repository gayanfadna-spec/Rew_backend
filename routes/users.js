const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// Get All Users (for dropdowns or admin)
router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find({}, 'id username name role');
        // Mongoose uses _id, but frontend might expect id.
        // Let's map _id to id if necessary, or just rely on frontend handling functionality.
        // For consistent API with previous version, let's map it.
        const response = users.map(u => ({
            id: u._id,
            username: u.username,
            name: u.name,
            role: u.role
        }));
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Delete User
router.delete('/:id', verifyToken, async (req, res) => {
    const userIdToDelete = req.params.id;
    const requesterRole = req.userRole;
    const requesterId = req.userId;

    if (requesterRole !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    if (userIdToDelete === requesterId) {
        return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    try {
        const deletedUser = await User.findByIdAndDelete(userIdToDelete);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

module.exports = router;
