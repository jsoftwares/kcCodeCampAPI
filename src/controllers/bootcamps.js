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

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from query string
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields to delete them from the received query strings; if left they would be treated by mongoose as fields
    removeFields.forEach( param => delete reqQuery[param]);
    
    // Create Query String
    let queryStr = JSON.stringify(reqQuery);
    // adds $ in front of d mongoose operators in query string read from URL so that we can pass it to find()
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Find resources
    query = Bootcamp.find(JSON.parse(queryStr));
    
    // Select Fields to return
    if (req.query.select) {
        // select query string should a comma separated fields; split() turns it to an array, then join converts
        //it to a space separated strings.
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    
    // Sort selected Resources by fields
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        // if sort is not sent as part of query string we want to always sort by createdAt data. - = DESC
        query = query.sort('-createdAt');
    }

    // Pagination
    /** page received will be string so parseInt cast it to integer. 10 is d radix (base number). if page is not 
     * part of query string, we default it to 1
     */
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page -1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();
    query = query.skip(startIndex).limit(limit);
    
    
    console.log(reqQuery);
    // Executing query
    const bootcamps = await query;


    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page -1,
            limit
        }
    }

    res.status(200).json({success: true, total, count: bootcamps.length, pagination, data: bootcamps});  
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