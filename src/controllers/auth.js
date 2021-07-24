const crypto = require('crypto');
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middlewares/async-handle');
const sendEmail = require('../utils/sendEmail');


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
    // const token = user.getSignedJwtToken();

    // res.status(201).json({success: true, token});
    sendTokenResponse(user, 200, res);
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
    // const token = user.getSignedJwtToken();

    // res.status(200).json({success: true, token});

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private

exports.getMe = asyncHandler( async (req, res, next) => {
    const user = await User.findById(req.user.id);  //req.user is set after JWT verification in auth middleware

    res.status(200).json({success: true, data: user});
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public

exports.forgotPassword = asyncHandler( async (req, res, next) => {
    const user = await User.findOne({email: req.body.email.toLowerCase()});
    if (!user) {
        return next(new ErrorResponse('There is no user with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    // console.log(resetToken);
    // getResetPasswordToken() also sets resetPasswordToken & resetPasswordExpiration fields of d user model it 
    // is called on, so we call save() on d model to persist d change.
    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const recipientName = user.name ? user.name : 'User';
    const message = `<h4 style='text-align:center'>Password Reset</h4>
        <p><strong>Dear ${recipientName}</strong></p>
        <p>You are recieving this email because you (or someone else) has requested a password request for 
        your account.</p>
        <p>Please make a PUT request to: </p>
        ${resetUrl}`;

        // Send email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset',
                message
            });
            res.status(200).json({success: true, data: 'Email sent.'});
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiration = undefined;
            await user.save();
            return next(new ErrorResponse('Email could not be sent', 500));
        }
});

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public

exports.resetPassword = asyncHandler( async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpiration: { $gt: Date.now() }
    });
    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiration = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});


// @desc    Update logged user details
// @route   PUT /api/v1/auth/changepassword
// @access  Private

exports.updateUserDetails = asyncHandler( async (req, res, next) => {
    const {name, email } = req.body;

    const fieldsToUpdate = {};
    if (name) {
        fieldsToUpdate.name = name.toUpperCase();
    }
    if (email) {
        fieldsToUpdate.email = email.toLowerCase();
    }
    
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({success: true, data: user});
});

exports.changePassword = asyncHandler( async (req, res, next) => {
    
    const user = await User.findById(req.user.id).select('+password');

    // Check that value of currentPassword field matches DB password
    if (!(await user.comparePassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401))
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});





// Helper to  Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode,res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 60 * 60 * 1000), //3hours from current time
        httpOnly: true
    };

    if (process.env.NODE_ENV ===  'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)    //cookie(key/name_of_cookie, value, options/cofig)
        .json({
            success: true,
            token
        });
} 