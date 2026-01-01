const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    // Bearer <token>
    const bearer = token.split(' ');
    const tokenValue = bearer[1];

    if (!tokenValue) return res.status(403).json({ error: 'Malformed token' });

    jwt.verify(tokenValue, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
        if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

module.exports = verifyToken;
