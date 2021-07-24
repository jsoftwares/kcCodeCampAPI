const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middlewares/async-handle');

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin

exports.getUsers = asyncHandler( async (req, res, next) => {
    res.status(200).json(res.advanceResults);
});

// @desc    Get a single user
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin

exports.getUser = asyncHandler( async (req, res, next) => {
    const user = await User.findById(req.params.id)

    res.status(200).send({success: true, data: user});
});


// @desc    Create user
// @route   POST /api/v1/auth/users
// @access  Private/Admin

exports.createUser = asyncHandler( async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(200).send({success: true, data: user});
});

// @desc    Update user
// @route   PUT /api/v1/auth/users/:id
// @access  Private/Admin

exports.updateUser = asyncHandler( async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).send({success: true, data: user});
});

// @desc    Update user
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin

exports.deleteUser = asyncHandler( async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    res.status(200).send({success: true, data: {}});
});





