const User = require('../models/user');
const formidable = require('formidable');
const _ = require('lodash');
const Blog = require('../models/blog');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};

exports.publicProfile = (req, res) => {
  const { username } = req.params;
  let user;
  let blogs;

  User.findOne({ username }).exec((err, userFromDB) => {
    if (err || !userFromDB) {
      return res.status(400).json({ error: 'User Not Found' });
    }
    user = userFromDB;
    let userId = user._id;
    Blog.find({ postedBy: userId })
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name')
      .limit(10)
      .select(
        '_id title slug excerpt categories tags postedBy createdAt updatedAt'
      )
      .exec((err, blogsFromDB) => {
        if (err) {
          return res.status(400).json({ error: errorHandler(err) });
        }
        user.photo = undefined;
        user.hashed_password = undefined;
        blogs = blogsFromDB;
        res.json({ user, blogs });
      });
  });
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtension = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Photo Could not be uploaded' });
    }

    let user = req.profile;
    user = _.extend(user, fields);

    if (fields.password && fields.password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password should be at least 6 character' });
    }

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: 'Image size should be less than 1Mb' });
      }
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;
    }
    user.save((err, result) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      user.photo = undefined;
      res.json(user);
    });
  });
};

exports.photo = (req, res) => {
  const username = req.params.username;
  User.findOne({ username }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    if (user.photo.data) {
      res.set('Content-Type', user.photo.contentType);
      return res.send(user.photo.data);
    }
  });
};
