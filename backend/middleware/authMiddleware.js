const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if authorization header exists and is in the right format
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

            // Get user from the token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }

            next();
            return; // Exit the function after calling next()
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    // If we reach here, it means no token was provided
    res.status(401);
    throw new Error('Not authorized, no token');
});

module.exports = { protect };