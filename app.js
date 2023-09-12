const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');


const app = express();
const PORT = 3000;

var destinatario = ''; // Esta variable queda vacía hasta que se aaceda ala ruta '/app' y se le asigne el valor del parámetro 'email' que aparece en la URL personalizada.

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
  // Estas son las credenciales de una Base de Datos de prueba en mi localhost
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'logindatabase'


  // Estas son las credenciales de una Base de Datos de prueba en el servidor de freesqldatabase.com
  //App deployada para test en el servidor gratuito de render.com. Se accede mediante el link https://login-sa-historias-clinicas-2.onrender.com
  //La base de datos de freesqldatabase.com se puede visualizar accediendo al link https://www.phpmyadmin.co/ con las correspondientes credenciales.
  /*host: 'sql10.freesqldatabase.com',
  user: 'sql10643279',
  password: 'WM5jknmXy9',
  database: 'sql10643279'*/
});

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    // Las siguientes credenciales deberían encontrarse guardadas en variables de entorno y ser accedidas a través de un módulo como dotenv.
    user: 'julcorradi@gmail.com', // Aquí debe ir la dirección oficial del sanatorio
    pass: 'lslxkjmrhpwgqisv' // Esta es una clave creada específicamente para darle permiso a la aplicación de manejar el mail.
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

  const serverURL = `${req.protocol}://${req.get('host')}`; // Variable que guarda la URL del servidor donde se despliega la aplicación.

  // Validación: Verificar que no haya campos en blanco y que cumplan con restricciones
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    //No hace nada, solo se mantiene la página cargando mostrando el mensaje de error hasta que el usuario presione el botón de "Inténtelo Denuevo".
  };

  // Validación: Verificar que la contraseña tenga al menos 8 caracteres, al menos una minúscula, al menos una mayúscula, al menos un carácter especial y al menos un número.
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).{8,}$/;
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
          const hashedPassword = bcrypt.hashSync(password, 10); // Se usa "hashSync" en lugar de "hash" para evitar tratar esta parte del código de forma asíncrona. Pero si en un futuro la App tiene mucha concurrencia o por otras razones se requiere que el encriptado se realice de forma asíncrona, habría que considerar usar "hash" de forma asíncrona.
          console.log(hashedPassword);
          db.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            (err, result) => {
              if (err) {
                console.log(err);
                res.redirect('/');
              } else {
                transporter.sendMail({
                  from: 'julcorradi@gmail.com', // Aquí va el correo oficial del sanatorio
                  to: destinatario, // Aquí debe ir el correo del usuario que se obtiene del parámetro email de la URL
                  subject: 'Registro exitoso',
                  html: `<p>Hola, su registro en la aplicación fue exitoso. Puede acceder a su cuenta con su mail y la clave que creó en el siguiente <a href='${serverURL}/indexLogin.html'>link</a>.</p>`//`Hola, su registro en la aplicación fue exitoso. Puede acceder a su cuenta con su mail y la clave que creó en el siguiente link ${serverURL}/indexLogin.html` Aquí se debe enviar el link de la ruta a la página de registro
                }, (error, info) => {
                  if (error) {
                    console.log('Error al enviar el correo electrónico:', error);
                  } else {
                    console.log('Correo electrónico enviado:', info.response);
                  }
                });
                res.redirect('/indexRegistroExitoso.html');
              }
            }
          );
        }
      }  
    );
  }
});

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validación: Verificar que no haya campos en blanco y que cumplan con restricciones
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    res.redirect('/indexLoginVacio.html');
  } else {
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
  }
});

// Ruta del panel de control después del inicio de sesión exitoso. En realidad aqui se debe seguir el link al portal con las historias clínicas.
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send(`¡Hola, ${req.session.user.username}! Has iniciado sesión correctamente.`);
  } else {
    res.redirect('/');
  }
});

// Ruta personalizada para el registro, donde la URL contiene un parámetro "email" con la dirección de mail desde donde se está accediendo.
app.get('/app', (req, res) => {
  const email = req.query.email; // Obtiene el parámetro "email" de la URL

  // Verifica si se proporciona un correo electrónico en la URL
  if (!email || email.trim() === '') {
    // Si no se proporciona un correo electrónico, redirige o maneja el error de alguna manera
    console.log('No se proporcionó un correo electrónico válido en la URL.');
    res.redirect('/'); // Puedes redirigir al usuario a la página de inicio de sesión u otra página adecuada
  } else {
    // Si se proporciona un correo electrónico válido en la URL se redirige a la ruta
    res.sendFile(__dirname + '/index.html');
    destinatario = email; // Se le asigna el valor del parámetro "email" a la variable "destinatario".
  }
});


app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});

