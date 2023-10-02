const bcrypt = require('bcrypt');
const db = require('../dataBase/db'); // Importa la instancia de conexión a la base de datos desde db.js
const { emailMessage } = require('../nodeMailer/nodeMailer')// Importa la instancia de nodeMailer desde nodeMialer.js
const passwordRegex = require('../regex/regex'); // Importa la variable con el regex.
require('dotenv').config(); // Se traen las variables de entorno del archvio .env

module.exports = {
    nuevaContrasena: (req, res) => {
        const { username, token, password } = req.body;
      var serverURL = `${req.protocol}://${req.get('host')}`; // Variable que guarda la URL del servidor donde se despliega la aplicación.
      
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
                  emailMessage(username, 'Contraseña Actualizada', `<p>Hola, su contraseña ha sigo actualizada correctamente. Ahora puede ingresar a su cuenta siguiendo el siguiente <a href='${serverURL}/indexLogin.html'>link</a> e introduciendo su mail y su nueva contraseña.</p>`);
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