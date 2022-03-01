const { body } = require('express-validator');

exports.contactFormValidator = [
  body('name').not().isEmpty().withMessage('Name is Required'),
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('message')
    .not()
    .isEmpty()
    .isLength({ min: 20 })
    .withMessage('Message must be at least 20 characters long'),
];
