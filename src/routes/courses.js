const express = require('express');
const { getCourses, getCourse } = require('../controllers/courses');

const router = express.Router({ mergeParams: true }); //mergeParams ensure d req we transfer from bootcamp router works

router.route('/')
    .get(getCourses);

router.route('/:id').get(getCourse);


module.exports = router;
