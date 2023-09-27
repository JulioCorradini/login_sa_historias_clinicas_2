const mysql = require('mysql2');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Se traen las variables de entorno del archvio .env

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
    // Variables de entorno con las credenciales de una Base de Datos de prueba en mi localhost
    host: process.env.DB_HOST_LOCAL,
    user: process.env.DB_USER_LOCAL,
    password: process.env.DB_PASS_LOCAL,
    database: process.env.DB_NAME_LOCAL
  
  
    // Estas son las varirables de entorno con las credenciales de una Base de Datos de prueba en el servidor de freesqldatabase.com
    //App deployada para test en el servidor gratuito de render.com. Se accede mediante el link https://login-sa.onrender.com/
    //La base de datos de freesqldatabase.com se puede visualizar accediendo al link https://www.phpmyadmin.co con las correspondientes credenciales.
    /*host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME*/
  });


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

module.exports = {
    recuperacion: (req, res) => {
        const { username } = req.body;
      const token = Math.floor(Math.random() * (100 - 1)) + 1; // Se crea un token de seguridad para el proceso de recuperación de cuenta.
      var serverURL = `${req.protocol}://${req.get('host')}`; // Variable que guarda la URL del servidor donde se despliega la aplicación.
      db.query(
        'UPDATE users SET token = ? WHERE username = ?',
        [token, username],
        async (err, result) => {
          if (err) {
            res.redirect('/');
          } if(result) {
            transporter.sendMail({
              from: EMAIL_USER,// Aquí va el correo oficial del sanatorio
              to: username,//destinatario, // Aquí debe ir el correo del usuario que se obtiene del parámetro email de la URL
              subject: 'Recuperación de cuenta',
              html: `<p>Hola, para recuperar su cuenta debe crear una nueva contraseña. Siga el siguiente <a href='${serverURL}/indexNuevaContraseña.html'>link</a>, introduzca el siguiente código de seguridad ${token}, y siga las instrucciones.</p>`
            }, (error, info) => {
              if (error) {
                console.log('Error al enviar el correo electrónico:', error);
              } else {
                console.log('Correo electrónico enviado:', info.response);
              }
            });
          }
        }
      );
      }
}