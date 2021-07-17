const { find } = require("../models/Bootcamp");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");


// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find(); 
        res.status(200).json({success: true, count: bootcamp.length, data: bootcamps});  
    } catch (err) {
        next(err);
    }
};


// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            throw new Error('Bootcamp not found');  //move operation into the catch block
        }
        res.status(200).json({success: true, data: bootcamp});  
    } catch (err) {
        // res.status(400).json({ success: false});
        next(err);
    }
};


// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
    try {
        // console.log(req.body);
        const bootcamp = new Bootcamp(req.body);
        await bootcamp.save();
        res.status(201).send({
            success: true, 
            data: bootcamp
        });
        
        
    } catch (err) {
        next(err);
    }
};


// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
    
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,  //when we send response, we want d data to be d updated bootcamp
            runValidators: true //we want to run our mongoose validators on updates 
        });
    
        if (!bootcamp) {
            throw new Error('Bootcamp not found');
        }
        
        res.status(200).json({success: true, data: bootcamp}); 
        
    } catch (err) {
        next(err);
    }

}


// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    
        if (!bootcamp) {
            throw new Error('Bootcamp not found');
        }
        
        res.status(200).json({success: true, data: {} });
        
    } catch (err) {
        next(err);
    }
}