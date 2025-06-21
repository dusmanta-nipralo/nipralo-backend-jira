const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or another SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendProjectAssignmentEmail = async (toEmail, projectName) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Assigned to Project: ${projectName}`,
    text: `You have been assigned to the project: ${projectName}`
  });
};
