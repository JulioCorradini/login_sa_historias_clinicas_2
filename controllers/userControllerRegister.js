const bcrypt = require('bcrypt');
const transporter = require('../nodeMailer/nodeMailer')// Importa la instancia de nodeMailer desde nodeMialer.js
const db = require('../dataBase/db'); // Importa la instancia de conexión a la base de datos desde db.js
require('dotenv').config(); // Se traen las variables de entorno del archvio .env

const EMAIL_USER = process.env.EMAIL_USER; // Variable para guardar el usuario de nodeMailer

module.exports = {
  register: async (req, res) => {
    const { username, password } = req.body;

  var serverURL = `${req.protocol}://${req.get('host')}`; // Variable que guarda la URL del servidor donde se despliega la aplicación.

  // Validación: Verificar que la contraseña tenga al menos 8 caracteres, al menos una minúscula, al menos una mayúscula, al menos un carácter especial y al menos un número.
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!()\-_{}[\]:;"'<>,.?/\\|]).{8,}$/;
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
          return res.redirect('/indexRegistroError.html');
        }else{
            //Si el nombre de usuario no existe, proceder con el registro.
            const token = Math.floor(Math.random() * (100 - 1)) + 1; // Se crea un token de seguridad para el proceso de confirmación de registro.
            const hashedPassword = bcrypt.hashSync(password, 10); // Se usa "hashSync" en lugar de "hash" para evitar tratar esta parte del código de forma asíncrona. Pero si en un futuro la App tiene mucha concurrencia o por otras razones se requiere que el encriptado se realice de forma asíncrona, habría que considerar usar "hash" de forma asíncrona.
            console.log(hashedPassword);
            db.query(
              'INSERT INTO users (username, password, token, confirmacion) VALUES (?, ?, ?, ?)',
              [username, hashedPassword, token, 0],
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.redirect('/');
                } else {
                  transporter.sendMail({
                    from: EMAIL_USER,// Aquí va el correo oficial del sanatorio
                    to: username,//destinatario, // Aquí debe ir el correo del usuario que se obtiene del parámetro email de la URL
                    subject: 'Registro exitoso',
                    html: `<p>Hola, su registro está casi completo. Para confirmar el proceso ingrese al siguiente <a href='${serverURL}/indexConfirmacion.html'>link</a> e introduzca el siguiente código de seguridad ${token}. Tiene 5 minútos para realizar este procezo de confirmación, de lo contrario su cuenta será borrada de nuestro sistema y deberá repetir el registro.</p>`
                  }, (error, info) => {
                    if (error) {
                      console.log('Error al enviar el correo electrónico:', error);
                    } else {
                      console.log('Correo electrónico enviado:', info.response);
                    }
                  });
                  res.redirect('/indexRegistroExitoso.html');
                  //Aquí hay un temporizador que al finalizar cierto tiempo ejecuta una función que borra los regisros no confirmados de la base de datos. Es decir, los que tienen un 0 en el campo 'confirmacion'.
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
                          transporter.sendMail({
                            from: EMAIL_USER,// Aquí va el correo oficial del sanatorio
                            to: username,//destinatario, // Aquí debe ir el correo del usuario que se obtiene del parámetro email de la URL
                            subject: 'Su tiempo expiró',
                            html: `<p>Hola, lamentamos informarle que el tiempo para confirmar su registro ha caducado, por lo que su cuenta se ha borrado de nuestro sistema. Para poder realizar el proceso de registro de forma satisfactoria siga el siguiente <a href='${serverURL}/index.html'>link</a>, vuelva introducir su mail y cree una contraseña. Luego siga las insrucciones detalladas para confirmar el registro dentro del tiempo estimado.</p>`
                          }, (error, info) => {
                            if (error) {
                              console.log('Error al enviar el correo electrónico:', error);
                            } else {
                              console.log('Correo electrónico enviado:', info.response);
                            }
                          });
                        }
                      }
                    )}, 5 * 60000);
                }
              }
            );
          }
      }  
    );
  }
  }
};
