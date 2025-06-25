const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendProjectCreationEmail = async (recipients, projectName) => {
  const mailOptionsProject = {
    from: process.env.EMAIL_USER,
    to: recipients, // Array or comma-separated string
    subject: `New Project Created: ${projectName}`,
    html: `<p>Hello Team,</p>
           <p>A new project "<strong>${projectName}</strong>" has been created.</p>
           <p>Please check the project dashboard for more details.</p>`
  };

  await transporter.sendMail(mailOptionsProject);
};

exports.sendBacklogAssignmentEmail = async (to, summary) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'New Backlog Task Assigned to You',
    text: `You have been assigned a new backlog task:\n\n${summary}`
  });
};

  exports.sendBacklogExplicit = async (to,summary)=>{
    await  transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject:'Added Backlog in Ongoing sprint !!!!!',
      text:`Your are added in ongoing sprint:\n\n${summary}`
    })
  }

  exports.sendMail = async ({ to, subject, text }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
};


exports.sendProjectAssignmentEmail = async (toEmail, projectName) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Assigned to Project: ${projectName}`,
    text: `You have been assigned to the project: ${projectName}`
  });
};


