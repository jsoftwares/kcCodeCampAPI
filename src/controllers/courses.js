const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middlewares/async-handle');


// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {

    let query;
    if (req.params.bootcampId) {
        query = Course.find({bootcamp: req.params.bootcampId});
    }else{
        query = Course.find().populate({ path: 'bootcamp', select: 'name description'});
    }

    const courses = await query;

    res.status(200).json({success: true, count: courses.length, data: courses});  
});


// @desc    Get single course
// @route   GET /api/v1/course/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`No couse with the ID ${req.params.id}`, 404));
    }

    res.status(200).json({success: true, data: course});  
});
