const _ = require('lodash');
const User = require('../models/user');
const Blog = require('../models/blog');
const shortId = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler');
const nodemailer = require('nodemailer');

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({ error: 'Email already is taken ' });
    }

    const { name, email, password } = req.body;
    let username = shortId.generate();
    let profile = `${process.env.CLIENT_URL}/profile/${username}`;

    let newUser = new User({ name, email, password, username, profile });
    newUser.save((err, success) => {
      if (err) return res.status(400).json({ error: err });

      // res.status(201).json({ user: success });

      res.json({ message: 'Signup success.Please Login' });
    });
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  // check if user exists
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: 'User with this email was not found. Please Signup' });
    }

    // authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    // generate a token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.cookie('token', token, { expiresIn: '1d' });

    const { _id, name, username, email, role } = user;

    res.json({
      token,
      user: { _id, name, username, email, role },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie('token');

  res.json({
    message: 'Signout Success',
  });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(401).json({
        error: 'User with this email does not Exist',
      });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_FORGOT_PASSWORD_SECRET,
      {
        expiresIn: '10m',
      }
    );

    // email
    //   1) Create a Transporter
    const transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: `${process.env.OUTLOOK_ACCOUNT}`,
        pass: `${process.env.OUTLOOK_PASSWORD}`,
      },
    });

    //   // 2) Define the email options
    const mailOptions = {
      from: `${process.env.OUTLOOK_ACCOUNT}`,
      to: email,
      subject: `Password reset link`,
      html: `
        <h4>Please use the following link to reset your Password: </h4>
        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>https://seoblog.com</p>

    `,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.json({ error: errorHandler(err) });
      } else {
        transporter.sendMail(mailOptions).then((sent) => {
          return res.json({
            message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10 minutes`,
          });
        });
      }
    });

    // populate the db > user > resetPasswordLink
  });
};

exports.resetPassword = (req, res) => {
  const newPassword = req.body.newPassword;
  const resetPasswordLink = req.body.resetPasswordLink;

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_FORGOT_PASSWORD_SECRET,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({
            error: 'Expired link. Try again',
          });
        }
        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(401).json({
              error: 'Something went wrong. Try later',
            });
          }
          const updatedFields = {
            password: newPassword,
            resetPasswordLink: '',
          };

          user = _.extend(user, updatedFields);

          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            }
            res.setHeader('Content-Type', 'application/json');
            res.json({
              message: `Great! Now you can login with your new password`,
            });
          });
        });
      }
    );
  }
};

// exports.resetPassword = (req, res) => {
//   const { resetPasswordLink, newPassword } = req.body;

//   if (resetPasswordLink) {
//     jwt.verify(
//       resetPasswordLink,
//       process.env.JWT_FORGOT_PASSWORD_SECRET,
//       function (err, decode) {
//         if (err) {
//           console.log(err);
//           return res
//             .status(401)
//             .json({ error: 'Expired Link. Please try again' });
//         }
//         User.findOne({ resetPasswordLink }, (err, user) => {
//           if (err || !user) {
//             console.log(err);
//             return res
//               .status(401)
//               .json({ error: 'Something went wrong. Try later' });
//           }

//           const updatedFields = {
//             password: newPassword,
//             resetPasswordLink: '',
//           };
//           user = _.extend(user, updatedFields);

//           user.save((err, result) => {
//             if (err) {
//               console.log(err);
//               return res.status(400).json({ error: errorHandler(err) });
//             }
//             res.json({
//               message: 'Great! now you can login with your new Password',
//             });
//           });
//         });
//       }
//     );
//   }
// };

// middlewares

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['sha1', 'RS256', 'HS256'],
});

exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'User not Found' });
    }
    req.profile = user;
    next();
  });
};

exports.adminMiddleware = (req, res, next) => {
  const adminId = req.user._id;
  User.findById({ _id: adminId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'User not Found' });
    }
    if (user.role !== 1) {
      return res.status(400).json({ error: 'Admin resource. Access Denied' });
    }
    req.profile = user;
    next();
  });
};

exports.canUpdateDeleteBlog = (req, res, next) => {
  const slug = req.params.slug.toLowerCase();

  Blog.findOne({ slug }).exec((err, blog) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }

    let authorizedUser =
      blog.postedBy._id.toString() == req.profile._id.toString();

    if (!authorizedUser) {
      return res.status(400).json({ error: 'You are not authorized' });
    }
    next();
  });
};
