const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middlewares/async-handle');


// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    // try {    //asyncHandler helps avoid repeating try/catch code

    let query;
    let queryStr = JSON.stringify(req.query);
    // adds $ in front of d mongoose aggregation fn in query tring read from URL so that we can pass it to find
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    console.log(queryStr);
    query = Bootcamp.find(JSON.parse(queryStr));
    const bootcamps = await query;
    res.status(200).json({success: true, count: bootcamps.length, data: bootcamps});  
    // } catch (err) {
    //     next(err);
    // }
});


// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            throw new Error('Bootcamp not found');  //move operation into the catch block
        }
        res.status(200).json({success: true, data: bootcamp});  
});


// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    
        // console.log(req.body);
        const bootcamp = new Bootcamp(req.body);
        await bootcamp.save();
        res.status(201).send({
            success: true, 
            data: bootcamp
        });

});


// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,  //when we send response, we want d data to be d updated bootcamp
            runValidators: true //we want to run our mongoose validators on updates 
        });
    
        if (!bootcamp) {
            throw new Error('Bootcamp not found');
        }
        
        res.status(200).json({success: true, data: bootcamp}); 

});


// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    
        if (!bootcamp) {
            throw new Error('Bootcamp not found');
        }
        
        res.status(200).json({success: true, data: {} });

});


// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {

    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calculate radius using radians
    // Divide distance by radius of the Earth
    // Earth Radius = 3,963 miles 6,378 Kilometers
    // docs.mongodb.com/manual/reference/operator/query/centerSphere
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }
        }
    });
    
    res.status(200).json({success: true, count: bootcamps.length, data: bootcamps });

});