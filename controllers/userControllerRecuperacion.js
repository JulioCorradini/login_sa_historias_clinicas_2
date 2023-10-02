const db = require('../dataBase/db'); // Importa la instancia de conexión a la base de datos desde db.js
const transporter = require('../nodeMailer/nodeMailer')// Importa la instancia de nodeMailer desde nodeMialer.js
require('dotenv').config(); // Se traen las variables de entorno del archvio .env

const EMAIL_USER = process.env.EMAIL_USER; // Variable para guardar el usuario de nodeMailer

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