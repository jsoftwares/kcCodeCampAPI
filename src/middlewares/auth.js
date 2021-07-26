const jwt = require('jsonwebtoken');
const asyncHandler = require('./async-handle');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');


exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized', 401));
    }
});

// Grant access to specific roles
// authorize takes a comma separated list of roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User with role '${req.user.role}' is unauthorized to perform this action`, 403));
        }

        next();
    }
};