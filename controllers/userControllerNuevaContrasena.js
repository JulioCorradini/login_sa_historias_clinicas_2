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
    nuevaContrasena: (req, res) => {
        const { username, token, password } = req.body;
      var serverURL = `${req.protocol}://${req.get('host')}`; // Variable que guarda la URL del servidor donde se despliega la aplicación.
      
      // Validación: Verificar que la contraseña tenga al menos 8 caracteres, al menos una minúscula, al menos una mayúscula, al menos un carácter especial y al menos un número.
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!()\-_{}[\]:;"'<>,.?/\\|]).{8,}$/;
      if (!password.match(passwordRegex)) {
        //No hace nada, solo se mantiene la página cargando mostrando el mensaje de error hasta que el usuario presione el botón de "Inténtelo Denuevo".
      } else {
        db.query(
        'SELECT * FROM users WHERE username = ? AND token = ?',
        [username, token],
        async (err, result) => {
          if (err) {
            res.redirect('/');
          } if(result.length > 0) {
            const newHashedPassword = bcrypt.hashSync(password, 10); // Se usa "hashSync" en lugar de "hash" para evitar tratar esta parte del código de forma asíncrona. Pero si en un futuro la App tiene mucha concurrencia o por otras razones se requiere que el encriptado se realice de forma asíncrona, habría que considerar usar "hash" de forma asíncrona.
            db.query(
              'UPDATE users SET password = ? WHERE username = ? AND token = ?',
              [newHashedPassword, username, token],
              async (err, result) => {
                if (err) {
                  res.redirect('/');
                } if (result) {
                  transporter.sendMail({
                    from: EMAIL_USER,// Aquí va el correo oficial del sanatorio
                    to: username,//destinatario
                    subject: 'Contraseña actualizada',
                    html: `<p>Hola, su contraseña ha sigo actualizada correctamente. Ahora puede ingresar a su cuenta siguiendo el siguiente <a href='${serverURL}/indexLogin.html'>link</a> e introduciendo su mail y su nueva contraseña.</p>`
                  }, (error, info) => {
                    if (error) {
                      console.log('Error al enviar el correo electrónico:', error);
                    } else {
                      console.log('Correo electrónico enviado:', info.response);
                    }
                  });
                  res.redirect('/indexNuevaContraseñaExitosa.html');
                }
              }
            )
          } else {
            // Si el token ingresado es incorrecto o si la contraseña ingresada no cumple con los requisitos.
            res.redirect('/indexErrorNuevaContraseña.html');
          }
        }
      );
      };
      }
}