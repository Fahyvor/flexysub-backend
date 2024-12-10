const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateJWT = (req, res, next) => {
    // Get the Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        console.error('No Authorization header provided');
        return res.status(401).send('Access Denied: No Token Provided');
    }

    try {
        console.log('Raw Authorization header:', authHeader);

        // Extract the token from the "Bearer <token>" format
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        console.log('Extracted Token:', token);

        // Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET, { algorithm: 'HS256' });
        console.log('Verified Token Payload:', verified);

        // Attach the verified payload to the request object
        req.auth = verified;

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Token verification error:', err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).send('Token Expired');
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(400).send('Invalid Token');
        }

        res.status(500).send('Internal Server Error');
    }
};

module.exports = { authenticateJWT };
