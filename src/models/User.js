const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
          minLength: [6, 'Password cannot be less than 6 characters'],
          select: false    //ensures when we get a User model that this field; password is not returned along
      },
      resetPasswordToken: String,
      resetPasswordExpiration: Date,
}, {
    timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
});

module.exports = mongoose.model('User', UserSchema);