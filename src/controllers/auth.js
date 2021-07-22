const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middlewares/async-handle');


// @desc    Register User
// @route   POST /api/v1/auth/register
// @access  Public

exports.register = asyncHandler( async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const user = await User.create({
        name: name.toUpperCase(),
        email: email.toLowerCase(),
        password,
        role
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({success: true, token});
});

// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public

exports.login = asyncHandler( async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please enter an email and password', 400));
    }
    // select('+password') included d password field in this query since we set it to false on d User model
    const user = await User.findOne({ email: email.toLowerCase()}).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({success: true, token});
});