const bcrypt = require('bcrypt');
const { emailMessage } = require('../nodeMailer/nodeMailer')// Importa la instancia de nodeMailer desde nodeMialer.js
const db = require('../dataBase/db'); // Importa la instancia de conexión a la base de datos desde db.js
const passwordRegex = require('../regex/regex'); // Importa la variable con el regex.
require('dotenv').config(); // Se traen las variables de entorno del archvio .env

module.exports = {
  register: async (req, res) => {
    const { username, password } = req.body;

  var serverURL = `${req.protocol}://${req.get('host')}`; // Variable que guarda la URL del servidor donde se despliega la aplicación.

  if (!password.match(passwordRegex)) {
    //No hace nada, solo se mantiene la página cargando mostrando el mensaje de error hasta que el usuario presione el botón de "Inténtelo Denuevo".
  } else {
    // Verificar si el nombre de usuario ya existe en la base de datos
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.redirect('/');
        }
        if (result.length > 0) {
          return res.redirect('/index/indexRegistroError.html');
        }else{
            //Si el nombre de usuario no existe, proceder con el registro.
            const token = Math.floor(Math.random() * (100 - 1)) + 1; // Se crea un token de seguridad para el proceso de confirmación de registro.
            const hashedPassword = bcrypt.hashSync(password, 10); // Se usa "hashSync" en lugar de "hash" para evitar tratar esta parte del código de forma asíncrona. Pero si en un futuro la App tiene mucha concurrencia o por otras razones se requiere que el encriptado se realice de forma asíncrona, habría que considerar usar "hash" de forma asíncrona.
            db.query(
              'INSERT INTO users (username, password, token, confirmacion) VALUES (?, ?, ?, ?)',
              [username, hashedPassword, token, 0],
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.redirect('/');
                } else {
                  emailMessage(username, 'Registro Exitoso', `<p>Hola, su registro está casi completo. Para confirmar el proceso ingrese al siguiente <a href='${serverURL}/index/indexConfirmacion.html'>link</a> e introduzca el siguiente código de seguridad ${token}. Tiene 5 minútos para realizar este procezo de confirmación, de lo contrario su cuenta será borrada de nuestro sistema y deberá repetir el registro.</p>`);
                  res.redirect('/index/indexRegistroExitoso.html');
                  //Aquí hay un temporizador que al finalizar cierto tiempo ejecuta una función que borra los registros no confirmados de la base de datos. Es decir, los que tienen un 0 en el campo 'confirmacion'.
                  setTimeout(()=>{
                    db.query(
                      'DELETE FROM users WHERE confirmacion = ? AND username = ?',
                      [0, username],
                      (err, result)=>{
                        if (err){
                          console.log(err);
                          res.redirect('/');
                        } if (result.affectedRows > 0) {
                          console.log("se borró el registro");
                          emailMessage(username, 'Su tiempo expliró', `<p>Hola, lamentamos informarle que el tiempo para confirmar su registro ha caducado, por lo que su cuenta se ha borrado de nuestro sistema. Para poder realizar el proceso de registro de forma satisfactoria siga el siguiente <a href='${serverURL}/index/index.html'>link</a>, vuelva introducir su mail y cree una contraseña. Luego siga las insrucciones detalladas para confirmar el registro dentro del tiempo estimado.</p>`)
                        }
                      }
                    )}, 5 * 60000); // Cuenta 5 minútos.
                }
              }
            );
          }
      }  
    );
  }
  }
};
