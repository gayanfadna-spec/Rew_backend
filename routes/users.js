const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

const bcrypt = require('bcryptjs');

// Get All Users (for dropdowns or admin)
router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find({}, 'id username name role email department'); // Include email and department
        // Mongoose uses _id, but frontend might expect id.
        // Let's map _id to id if necessary, or just rely on frontend handling functionality.
        // For consistent API with previous version, let's map it.
        const response = users.map(u => ({
            id: u._id,
            username: u.username,
            name: u.name,
            role: u.role,
            email: u.email,
            department: u.department
        }));
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Update User
router.put('/', verifyToken, (req, res) => {
    return res.status(400).json({ error: 'User ID is required for update' });
});

router.put('/:id', verifyToken, async (req, res) => {
    console.log("PUT /users/:id called with body:", req.body);
    const userIdToUpdate = req.params.id;
    const requesterRole = req.userRole;

    // Only admin can update other users. Users can technically update themselves if we implemented that logic,
    // but for now let's restrict to Admin for this specific feature request.
    if (requesterRole !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    try {
        const { name, username, email, role, password, department } = req.body;
        const updateData = { name, username, email, role, department };

        // If password is provided, hash it
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 8);
        }

        // Check for uniqueness if username/email changed
        // This is a bit complex without checking previous values, but Mongo will throw duplicate key error if unique index exists.
        // We can catch that error.

        const updatedUser = await User.findByIdAndUpdate(userIdToUpdate, updateData, { new: true, runValidators: true });

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User updated successfully', user: { id: updatedUser._id, name: updatedUser.name, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role, department: updatedUser.department } });

    } catch (err) {
        console.error("Update User Error:", err); // Log the actual error
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Username or Email already exists' });
        }
        res.status(500).json({ error: 'Error updating user: ' + err.message });
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
