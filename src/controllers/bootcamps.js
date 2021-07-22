const path = require('path');
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middlewares/async-handle');


// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    // try {    //asyncHandler helps avoid repeating try/catch code

    // we have access to advanceResults bcos d middleware adds it as an object to RES & d route that implements this
    // request handler uses this middleware
    res.status(200).json(res.advanceResults);  
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
    
        // Add user ID to req.body
        req.body.user = req.user.id;

        // Check for published Bootcamp ie if there user already has a Bootcamp
        const publishedBootcamp = !!await Bootcamp.findOne({user: req.user.id});

        // If d request user is not an admin, they can only create one Bootcamp
        if (publishedBootcamp && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User with ID ${req.user.id} has already published a bootcamp`, 400));
        }

        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true, 
            data: bootcamp
        });

});


// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    
        let bootcamp = await Bootcamp.findById(req.params.id);
    
        if (!bootcamp) {
            return next(new ErrorResponse('Bootcamp not found', 404));
        }

        // Make sure request user is bootcamp owner
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('User is unauthorized to perform this action', 401));
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,  //when we send response, we want d data to be d updated bootcamp
            runValidators: true //we want to run our mongoose validators on updates
        });
        
        res.status(200).json({success: true, data: bootcamp}); 

});


// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

        // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
        const bootcamp = await Bootcamp.findById(req.params.id);
    
        if (!bootcamp) {
            throw new Error('Bootcamp not found');
        }

        // Make sure request user is bootcamp owner
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('User is unauthorized to perform this action', 401));
        }

        bootcamp.remove();
        
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

// @desc    Upload photo
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    // Make sure request user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('User is unauthorized to perform this action', 401));
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;
    // Make sure uploaded file is a photo
    if(!file.mimetype.startsWith('image')) next(new ErrorResponse('Please upload an image file', 400));

    // Check file size
    if(!file.size > process.env.MAX_FILE_UPLOAD_SIZE) {
        return next(new ErrorResponse(`Please upload an image not bigger than ${process.env.MAX_FILE_UPLOAD_SIZE}`, 400))
    };

    // Create custom file name
    file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`;

    // Upload file to file to file system
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=> {
        if (err) {
            console.error(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }

        // Update bootcamp with photo name
        await Bootcamp.findByIdAndUpdate(bootcamp.id, { photo: file.name});

        res.status(200).json({
            success: true,
            data: file.name
        });
    });

});