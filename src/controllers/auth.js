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
    res.status(201).json({success: true})
});