const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const Course = require('../models/Course');
const advanceResultsFilter = require('../middlewares/advance-results-filter');
const router = express.Router({ mergeParams: true }); //mergeParams ensure d req we transfer from bootcamp router works
// Middleware
const { protect } = require('../middlewares/auth');

router.route('/')
    .get(advanceResultsFilter(Course, { path: 'bootcamp', select: 'name description'}), getCourses)
    .post(protect, addCourse);

router.route('/:id')
    .get(getCourse)
    .put(protect, updateCourse)
    .delete(protect, deleteCourse);


module.exports = router;
