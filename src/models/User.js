const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
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
          minLength: 6,
          select: false    //ensures when we get a User model that this field; password is not returned along
      },
      resetPasswordToken: String,
      resetPasswordExpiration: Date,
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);