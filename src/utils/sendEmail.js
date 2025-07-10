const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } = require('../config/environment');

async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject,
    text,
    html: html || text,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail; 