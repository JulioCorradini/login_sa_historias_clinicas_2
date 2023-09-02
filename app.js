const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');


const app = express();
const PORT = 3000;


// Configuración de la base de datos MySQL
const db = mysql.createConnection({
  // Estas son las credenciales de una Base de Datos de prueba en mi localhost
  /*host: 'localhost',
  user: 'root',
  password: '',
  database: 'logindatabase'*/


  // Estas son las credenciales de una Base de Datos de prueba en el servidor de freesqldatabase.com
  //App deployada para test en el servidor gratuito de render.com. Se accede mediante el link https://login-sa-historias-clinicas-2.onrender.com
  //La base de datos de freesqldatabase.com se puede visualizar accediendo al link https://www.phpmyadmin.co/ con las correspondientes credenciales.
  host: 'sql10.freesqldatabase.com',
  user: 'sql10643279',
  password: 'WM5jknmXy9',
  database: 'sql10643279'
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

  // Validación: Verificar que no haya campos en blanco y que cumplan con restricciones
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    console.log("Los campos no pueden estar en blanco");// Hay que arreglar esto para que devuelva el mensaje por pantalla.
  };

  // Validación: Verificar que la contraseña tenga al menos 8 caracteres, al menos una minúscula, al menos una mayúscula, al menos un carácter especial y al menos un número.
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).{8,}$/;
  if (!password.match(passwordRegex)) {
    console.log("La contraseña debe tener al menos 8 caracteres, al menos una minúscula, al menos una mayúscula, al menos un dígito y al menos un caracter especial"); // Hay que arreglar esto para que devuelva el mensaje por pantalla.
    res.redirect('/');
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
          console.log("El nombre de usuario ya está registrado.");
          return res.redirect('/');
        }else{
          //Si el nombre de usuario no existe, proceder con el registro.
          const hashedPassword = bcrypt.hashSync(password, 10); // Se usa "hashSync" en lugar de "hash" para evitar tratar esta parte del código de forma asíncrona. Pero si en un futuro la App tiene mucha concurrencia o por otras razones se requiere que el encriptado se realice de forma asíncrona, habría que sonsiderar usar "hash" de forma asíncrona.
          console.log(hashedPassword);
          db.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            (err, result) => {
              if (err) {
                console.log(err);
                res.redirect('/');
              } else {
                res.redirect('/');
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
    console.log('Los campos no pueden estar en blanco');// Hay que arreglar esto para que devuelva el mensaje por pantalla.
    res.redirect('/');
  } else {
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, result) => {
        if (err || result.length === 0) {
          res.redirect('/');
        } else {
          const isPasswordValid = await bcrypt.compare(password, result[0].password);
          if (isPasswordValid) {
            req.session.user = result[0];
            res.redirect('/dashboard'); // Aquí la acción tiene que ser la de seguir el link que redirige al portal con las historias clínicas.
          } else {
            res.redirect('/');
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

// Ruta para la aplicación personalizada
app.get('/app', (req, res) => {
  const email = req.query.email; // Obtiene el parámetro "email" de la URL

  // Verifica si se proporciona un correo electrónico en la URL
  if (!email || email.trim() === '') {
    // Si no se proporciona un correo electrónico, redirige o maneja el error de alguna manera
    console.log('No se proporcionó un correo electrónico válido en la URL.');
    res.redirect('/'); // Puedes redirigir al usuario a la página de inicio de sesión u otra página adecuada
  } else {
    // Si se proporciona un correo electrónico válido en la URL, puedes usarlo en tu aplicación
    // Por ejemplo, aquí puedes prellenar el campo de nombre de usuario en tu formulario
    res.sendFile(__dirname + '/index.html'); // Esto es solo un ejemplo, puedes adaptarlo según tus necesidades
  }
});


app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
