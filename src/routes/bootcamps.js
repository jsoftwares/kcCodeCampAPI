const express = require('express');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');
const Bootcamp = require('../models/Bootcamp');
// Middleware
const { protect, authorize } = require('../middlewares/auth');
const advanceResultsFilter = require('../middlewares/advance-results-filter');
// Include other resource routers
const courseRouter = require('./courses');


const router = express.Router();

// Re-route/Forward into other resource router
    /** eg (rather than bringing d getCourse controller in here, we just pass d request to d course router) */
router.use('/:bootcampId/courses', courseRouter);

router.route('/')
    .get(advanceResultsFilter(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('admin', 'publisher'), createBootcamp);

router.route('/:id/photo').put(protect, authorize('admin', 'publisher'), bootcampPhotoUpload);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('admin', 'publisher'), updateBootcamp)
    .delete(protect, authorize('admin', 'publisher'), deleteBootcamp);

module.exports = router;
