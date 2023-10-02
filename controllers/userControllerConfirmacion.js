const bcrypt = require('bcrypt');
const db = require('../dataBase/db'); // Importa la instancia de conexión a la base de datos desde db.js
const transporter = require('../nodeMailer/nodeMailer')// Importa la instancia de nodeMailer desde nodeMialer.js
require('dotenv').config(); // Se traen las variables de entorno del archvio .env

const EMAIL_USER = process.env.EMAIL_USER; // Variable para guardar el usuario de nodeMailer

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
