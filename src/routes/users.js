const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/users');
const User = require('../models/User');
const router = express.Router({ mergeParams: true }); //mergeParams ensure d req we transfer from bootcamp router works
// Middleware
const { protect, authorize } = require('../middlewares/auth');
const advanceResultsFilter = require('../middlewares/advance-results-filter');

// Applies middlewares to all routes.
// REM protect() decode token & add d user object to d req object. authorize() looks at d role in user object so should come after protect
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(advanceResultsFilter(User), getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);


module.exports = router;
