const nodemailer = require('nodemailer');
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.contactForm = (req, res) => {
  const { name, email, message } = req.body;

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
    from: email,
    to: `${process.env.OUTLOOK_ACCOUNT}`,
    subject: `Contact Form - ${process.env.APP_NAME}`,
    text: `Email received from contact form \n Sender name: ${name} \n Sender Email: ${email} \n Sender message: ${message}`,
    html: `
        <h4>Email received from contact form:</h4>
        <p>Sender name: ${name}</p>
        <p>Sender email: ${email}</p>
        <p>Sender message: ${message}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>https://seoblog.com</p>

    `,
  };

  transporter.sendMail(mailOptions).then((sent) => {
    console.log('Message sent: %s', sent.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(sent));
    res.json({ success: true });
  });
};

exports.contactBlogAuthorForm = (req, res) => {
  const { authorEmail, name, email, message } = req.body;
  const mailList = [authorEmail, `${process.env.OUTLOOK_ACCOUNT}`];

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
    from: email,
    to: mailList,
    subject: `Someone messaged you from  ${process.env.APP_NAME}`,
    text: `Email received from contact form \n Sender name: ${name} \n Sender Email: ${email} \n Sender message: ${message}`,
    html: `
        <h4>MEssage received from:</h4>
        <p>name: ${name}</p>
        <p>email: ${email}</p>
        <p>message: ${message}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>https://seoblog.com</p>

    `,
  };

  transporter.sendMail(mailOptions).then((sent) => {
    console.log('Message sent: %s', sent.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(sent));
    res.json({ success: true });
  });
};
