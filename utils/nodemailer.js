const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use Outlook, Zoho, SMTP, etc.
  auth: {
    user:"naidudusmanta@gmail.com",
    pass: 'ckkrzshowkoqcnxz'
  }
});

const sendMail = async ({ to, subject, text }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
};

module.exports = sendMail;
