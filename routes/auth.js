const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'secret_key';

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        // Always force role to be employee unless admin is created manually
        const role = 'employee';

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const user = await User.create({
            username,
            password: hashedPassword,
            name,
            role
        });

        // Generate token immediately
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
            expiresIn: 86400 // 24 hours
        });

        res.status(201).json({ message: 'User registered successfully', auth: true, token, user: { id: user._id, name: user.name, role: user.role, username: user.username } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ token: null, error: 'Invalid password' });

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).json({ auth: true, token, user: { id: user._id, name: user.name, role: user.role, username: user.username } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
