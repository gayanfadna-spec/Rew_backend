const axios = require('axios');

const run = async () => {
    try {
        console.log('Logging in as admin...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'admin' // Assuming default admin password
        });

        const token = loginRes.data.token;
        console.log('Logged in. Token obtained.');

        console.log('Calling delete-all...');
        const res = await axios.post('http://localhost:5000/api/tasks/delete-all',
            { username: 'admin', password: 'admin' },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Response:', res.data);

    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
};

run();
