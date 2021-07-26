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

// Static method to get average rating for a Bootcamp and save
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId}
        },
        { 
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating'}
            }
    }
    ]);
    console.log(obj);
    // Update the bootcamp in database & add averageRating as a field
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        })
    } catch (err) {
        console.error(err);
    }
}

// Call getAverageRating after saving Review
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before deleting Review
ReviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.bootcamp);
});


module.exports = mongoose.model('Review', ReviewSchema);