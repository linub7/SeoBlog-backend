const { body } = require('express-validator');

exports.userSignupValidator = [
  body('name').not().isEmpty().withMessage('Name is Required'),
  body('email').isEmail().withMessage('Enter a valid Email Address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 character'),
];

exports.userSignInValidator = [
  body('email').isEmail().withMessage('Enter a valid Email Address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 character'),
];

exports.forgotPasswordValidator = [
  body('email')
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('Enter a valid email please'),
];

exports.resetPasswordValidator = [
  body('password')
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];
