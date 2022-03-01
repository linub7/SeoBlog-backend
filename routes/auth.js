const express = require('express');
const {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword,
  requireSignin,
} = require('../controllers/auth');
const router = express.Router();

//validation
const { runValidation } = require('../validators');
const {
  userSignupValidator,
  userSignInValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth');

router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/signin', userSignInValidator, runValidation, signin);
router.get('/signout', signout);

// forgot and reset password
router.put(
  '/forgot-password',
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);
router.put(
  '/reset-password',
  resetPasswordValidator,
  runValidation,
  resetPassword
);

module.exports = router;
