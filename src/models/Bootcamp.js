const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');


const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
      },
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      address: {
        type: String,
        required: [true, 'Address is required']
      },
      location: {
          // GeoJSON Point
          type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
          
      },
      careers: {
          type: [String],
          required: true,
          enum: [
              'Web Development',
              'Mobile Development',
              'FinTech',
              'UI/UX',
              'Data Science',
              'Business',
              'Others'
          ]
      },
      averageRating: {
          type: Number,
          min: [1, 'Rating must be at least 1'],
          max: [10, 'Rating cannot be more than 10']
      },
      averageCost: Number,
      photo: {
          type: String,
          default: 'no-photo.jpg'
      },
      housing: {
        type: Boolean,
        default: false
      },
      jobAssistance: {
        type: Boolean,
        default: false
      },
      jobGuarantee: {
        type: Boolean,
        default: false
      },
      acceptGi: {
        type: Boolean,
        default: false
      },
}, 
{
    timestamps: true,
    toJSON: {
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
        }
    }
}

);

// Create bootcamp slug form name
BootcampSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true});
  next();
});

// Geocode & create location field
BootcampSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);  //retuns an array with a single object
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Omit saving customer entered address bcos we now have it in location object
  this.address = undefined;
  
  next();
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);