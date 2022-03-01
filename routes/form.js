const express = require('express');
const { contactForm, contactBlogAuthorForm } = require('../controllers/form');

const { runValidation } = require('../validators');
const { contactFormValidator } = require('../validators/form');

const router = express.Router();

router.post('/contact', contactFormValidator, runValidation, contactForm);
router.post(
  '/contact-blog-author',
  contactFormValidator,
  runValidation,
  contactBlogAuthorForm
);

module.exports = router;
