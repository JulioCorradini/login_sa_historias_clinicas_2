const db = require('../dataBase/db'); // Importa la instancia de conexión a la base de datos desde db.js
const { emailMessage } = require('../nodeMailer/nodeMailer')// Importa la instancia de nodeMailer desde nodeMialer.js
require('dotenv').config(); // Se traen las variables de entorno del archvio .env

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
            emailMessage(username, 'Recuperación de contraseña', `<p>Hola, para recuperar su cuenta debe crear una nueva contraseña. Siga el siguiente <a href='${serverURL}/index/indexNuevaContraseña.html'>link</a>, introduzca el siguiente código de seguridad ${token}, y siga las instrucciones.</p>`)
          }
        }
      );
      }
}