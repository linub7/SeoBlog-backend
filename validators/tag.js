const { body } = require('express-validator');

exports.tagCreateValidator = [
  body('name').not().isEmpty().withMessage('Name is Required'),
];
