const bcrypt = require('bcrypt');
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
    confirmacion: (req, res) => {
        const { username, token } = req.body;
      var serverURL = `${req.protocol}://${req.get('host')}`; // Variable que guarda la URL del servidor donde se despliega la aplicación.
      db.query(
        'SELECT * FROM users WHERE username = ? AND token = ?',
        [username, token],
        (err, result) => {
          if(err) {
            console.log(err);
            res.redirect('/');
          } if (result.length > 0) {
            db.query (
              'UPDATE users SET confirmacion = ? WHERE username = ?',
                [1, username],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.redirect('/');
                  } else {
                    res.redirect('/indexConfirmacionExitosa.html');
                    transporter.sendMail({
                      from: EMAIL_USER,// Aquí va el correo oficial del sanatorio
                      to: username,//destinatario, // Aquí debe ir el correo del usuario que se obtiene del parámetro email de la URL
                      subject: 'Confirmación exitosa',
                      html: `<p>Hola, ya hemos confirmado su registro y el proceso ha sido completado con exito. Para ingresar a su cuenta siga el siguiente <a href='${serverURL}/indexLogin.html'>link</a> e introduzca su mail y su contraseña.</p>`
                    }, (error, info) => {
                      if (error) {
                        console.log('Error al enviar el correo electrónico:', error);
                      } else {
                        console.log('Correo electrónico enviado:', info.response);
                      }
                    });
                  }
                }
            )
          } else {
            res.redirect('/indexTokenInvalido.html');
          } 
        }
      )
      }
}
