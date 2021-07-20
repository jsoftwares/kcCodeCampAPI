const express = require('express');
const { getCourses } = require('../controllers/courses');

const router = express.Router({ mergeParams: true }); //mergeParams ensure d req we transfer from bootcamp router works

router.route('/')
    .get(getCourses);


module.exports = router;
