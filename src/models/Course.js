const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({

    title: {
        type: String,
        trim: true,
        required: [true, 'Course title is required']
    },
    description: {
        type: String,
        required: [true, 'Course description is required']
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
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

// Static method to get average of course tuitions
/**We create an aggregated obj. by calling AGGREGATE() which returns a promise on the model. AGGREGATE() takes
 * and array of pipeline steps. obj will be an array of one object with _id & averageCost of tuition
 * First we match d bootcamp field with what bootcampId is passed to this function. Next we use group to create d
 * calculated object we want to create which included d _id: which is d bootcampId, & d averageCost which we can 
 * get with the $AVG operator as key & d field (tuition) we can to calculate average on, as value
  */
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId}
        },
        { 
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition'}
            }
    }
    ]);
    console.log(obj);
    // Update the bootcamp in database & add averageCost as a field
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10 //(/10)/10) ensures we get an integer 
        })
    } catch (err) {
        console.error(err);
    }
}

// Call getAverageCost after saving Course
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before deleting Course
CourseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootcamp);
});


module.exports = mongoose.model('Course', CourseSchema);