const express = require('express');
const { getReviews } = require('../controllers/reviews');
const Review = require('../models/Review');
const router = express.Router({ mergeParams: true }); //mergeParams ensure d req we transfer from bootcamp router works
// Middlewares
const advanceResultsFilter = require('../middlewares/advance-results-filter');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
    .get(advanceResultsFilter(Review, { path: 'bootcamp', select: 'name description'}), getReviews)

module.exports = router;
