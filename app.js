const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT; // Variable de entorno para determinar el puerto de ejecución.

var destinatario = ''; // Esta variable queda vacía hasta que se acceda a la ruta '/app' y se le asigne el valor del parámetro 'email' que aparece en la URL personalizada.

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
  // Variables de entorno con las credenciales de una Base de Datos de prueba en mi localhost
  /*host: process.env.DB_HOST_LOCAL,
  user: process.env.DB_USER_LOCAL,
  password: process.env.DB_PASS_LOCAL,
  database: process.env.DB_NAME_LOCAL*/


  // Estas son las varirables de entorno con las credenciales de una Base de Datos de prueba en el servidor de freesqldatabase.com
  //App deployada para test en el servidor gratuito de render.com. Se accede mediante el link https://login-sa.onrender.com/
  //La base de datos de freesqldatabase.com se puede visualizar accediendo al link https://www.phpmyadmin.co con las correspondientes credenciales.
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

//Variables de entrorno con las credenciales para enviar el mail con "nodemailer".
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    // Las siguientes credenciales se encuentran guardadas en variables de entorno en el archivo ".env" y son accedidas a través de la librería "dotenv".
    user: EMAIL_USER,// Aquí debe ir la dirección oficial del sanatorio
    pass: EMAIL_PASS// Esta es una clave creada específicamente para darle permiso a la aplicación de manejar el mail.
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
  })
);
app.use(express.static(__dirname));

// Ruta de inicio
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Ruta de registro de usuario
app.post('/register', async (req, res) => {
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
});

// Ruta de confirmación de registro
app.post('/confirmacion', (req, res)=>{
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
})

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, result) => {
        if (err || result.length === 0) {
          res.redirect('/indexLoginError.html');
        } else {
          const isPasswordValid = await bcrypt.compare(password, result[0].password);
          if (isPasswordValid) {
            req.session.user = result[0];
            res.redirect('/dashboard'); // Aquí la acción tiene que ser la de seguir el link que redirige al portal con las historias clínicas.
          } else {
            res.redirect('/indexLoginError.html');
          }
        }
      }
    );
});

// Ruta del panel de control después del inicio de sesión exitoso. En realidad aqui se debe seguir el link al portal con las historias clínicas.
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send(`¡Hola, ${req.session.user.username}! Has iniciado sesión correctamente.`);
  } else {
    res.redirect('/');
  }
});

// Ruta de recuperación de contraseña
app.post('/recuperacion', (req, res)=>{
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
})

//Ruta de creación de nueva contraseña
app.post('/nuevaContrasena', (req, res)=>{
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
})


app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});

