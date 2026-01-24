
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'secret_key';
const API_URL = 'http://127.0.0.1:5000/api/users';

const run = async () => {
    try {
        // 1. Generate Admin Token
        const adminToken = jwt.sign({ id: 'dummy_admin_id', role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });

        // 2. Mock User ID (Need a real one, but let's try to update a known ID if possible, or create one)
        // Let's first GET users to find one.
        const usersRes = await axios.get(API_URL, { headers: { Authorization: `Bearer ${adminToken}` } });
        const users = usersRes.data;

        if (users.length === 0) {
            console.log("No users found to update.");
            return;
        }

        const targetUser = users.find(u => u.role === 'employee') || users[0];
        console.log(`Attempting to update user: ${targetUser.username} (${targetUser.id})`);

        // 3. Send PUT request
        const updateData = {
            name: targetUser.name + ' Updated',
            username: targetUser.username,
            email: targetUser.email,
            role: targetUser.role
        };

        const res = await axios.put(`${API_URL}/${targetUser.id}`, updateData, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log("Update Success:", res.data);

    } catch (err) {
        console.error("Update Failed:", err.response ? err.response.data : err.message);
    }
};

run();
