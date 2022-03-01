const { body } = require('express-validator');

exports.categoryCreateValidator = [
  body('name').not().isEmpty().withMessage('Name is Required'),
];
