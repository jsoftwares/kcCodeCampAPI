const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse } = require('../controllers/courses');

const router = express.Router({ mergeParams: true }); //mergeParams ensure d req we transfer from bootcamp router works

router.route('/')
    .get(getCourses)
    .post(addCourse);

router.route('/:id')
    .get(getCourse)
    .put(updateCourse);


module.exports = router;
