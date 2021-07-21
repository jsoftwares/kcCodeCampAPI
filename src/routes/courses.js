const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const Course = require('../models/Course');
const advanceResultsFilter = require('../middlewares/advance-results-filter');
const router = express.Router({ mergeParams: true }); //mergeParams ensure d req we transfer from bootcamp router works

router.route('/')
    .get(advanceResultsFilter(Course, { path: 'bootcamp', select: 'name description'}), getCourses)
    .post(addCourse);

router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);


module.exports = router;
