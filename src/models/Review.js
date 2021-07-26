const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({

    title: {
        type: String,
        trim: true,
        required: [true, 'Review title is required'],
        maxlength: [100, 'Review title cannot be more than 100 characters']
    },
    text: {
        type: String,
        required: [true, 'Review text is required']
    },
    rating: {
        type: Number,
        min: [1, 'Rating can only be between 1 and 10'],
        max: [10, 'Rating can only be between 1 and 10'],
        required: [true, 'Please add a rating between 1 and 10']
    },
    bootcamp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
    
}, { 
    timestamps: true,
    toJSON: {
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

/** Prevent a User from submitting more than one Review per Bootcamp:A user can only add one Reivew per Bootcamp */
ReviewSchema.index({bootcamp: 1, user: 1}, {unique: true});

module.exports = mongoose.model('Review', ReviewSchema);