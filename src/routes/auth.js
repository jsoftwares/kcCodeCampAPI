const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateUserDetails, changePassword } = require('../controllers/auth');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatedetails', protect, updateUserDetails);
router.put('/changepassword', protect, changePassword);

module.exports = router;