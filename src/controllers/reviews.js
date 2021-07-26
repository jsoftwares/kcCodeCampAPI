const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middlewares/async-handle');


// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        const reviews = await Review.find({bootcamp: req.params.bootcampId});
        return res.status(200).json({success: true, count: reviews.length, data: reviews});  

    }else{
        res.status(200).json(res.advanceResults);
    }

});

// @desc    Get a single reviews
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {

    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });
    if (!review) {
        return next(new ErrorResponse('Review was not found', 404));
    }
    
    return res.status(200).json({success: true, data: review});  

});

// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp with the ID ${req.params.bootcampId}`, 404));
    }

    const review = await Review.create(req.body);
    
    return res.status(201).json({success: true, data: review});  

});


// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {

    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(new ErrorResponse('Review not found', 401));
    }

    // Ensure review belongs to the request user or req user is an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authrorised to update this review'));
    }

    review.set(req.body);
    await review.save();
    
    return res.status(200).json({success: true, data: review});  

});


// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {

    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(new ErrorResponse('Review not found', 401));
    }

    // Ensure review belongs to the request user or req user is an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authrorised to update this review'));
    }

    review.remove();
    
    return res.status(200).json({success: true, data: {}});  

});