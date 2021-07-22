const express = require('express');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');

// Include other resource routers
const courseRouter = require('./courses');

const Bootcamp = require('../models/Bootcamp');
const advanceResultsFilter = require('../middlewares/advance-results-filter');

const router = express.Router();

// Middleware
const { protect } = require('../middlewares/auth');

// Re-route/Forward into other resource router
    /** eg (rather than bringing d getCourse controller in here, we just pass d request to d course router) */
router.use('/:bootcampId/courses', courseRouter);

router.route('/')
    .get(advanceResultsFilter(Bootcamp, 'courses'), getBootcamps)
    .post(protect, createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(protect, updateBootcamp)
    .delete(protect, deleteBootcamp);

router.route('/:id/photo').put(protect, bootcampPhotoUpload);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

module.exports = router;
