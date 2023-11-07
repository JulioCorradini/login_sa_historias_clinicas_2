const nodemailer = require('nodemailer');
require('dotenv').config();

//Variables de entrorno con las credenciales para enviar el mail con "nodemailer".
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

function emailMessage(username, subject, html ){
  transporter.sendMail({
    from: EMAIL_USER,
    to: username,
    subject: subject,
    html: html,
  }, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo electrónico:', error);
    } else {
      console.log('Correo electrónico enviado:', info.response);
    }
  })
}

module.exports = {
  emailMessage: emailMessage,
};