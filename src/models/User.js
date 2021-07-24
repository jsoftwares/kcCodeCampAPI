const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      role: {
          type: String,
          enum: ['user', 'publisher'],
          default: 'user'
      },
      password: {
          type: String,
          required: [true, 'Please add a password'],
          minlength: [6, 'Password cannot be less than 6 characters'],
          select: false    //ensures when we get a User model that this field; password is not returned along
      },
      resetPasswordToken: String,
      resetPasswordExpiration: Date,
}, {
    timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {  //only is password field is included in request should this middleware run
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
});

// Compare user entered password to hashed password in DB
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);   
}

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    try {
        return jwt.sign({ id: this.id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });
    } catch (error) {
        throw new Error(error.message);
    }
};

// Generate and hash Password token
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set it on resetPasswordToken field
    //With UPDATE(valueToHash) we hash d value we want to encode, then DIGEST('hex') converts it to a string
    // Check Node Crypto documentation for more on Crypto module
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiration time for resetToken to 10minutes
    this.resetPasswordExpiration = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


module.exports = mongoose.model('User', UserSchema);