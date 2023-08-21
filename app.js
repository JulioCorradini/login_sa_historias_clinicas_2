const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost', // Estas son las credenciales de una Base de Datos de prueba.
  user: 'root',
  password: '',
  database: 'logindatabase'
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
  const hashedPassword = await bcrypt.hash(password, 10);

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
});

// Ruta de inicio de sesión
app.post('/login', [
  body('username').notEmpty().withMessage('El nombre de usuario es obligatorio'), // Esta funcionalidad de validación todavía no funciona bien
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
], (req, res) => {
  const { username, password } = req.body;

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
});

// Ruta del panel de control después del inicio de sesión exitoso. En realidad aqui se debe seguir el link al portal con las historias clínicas.
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send(`¡Hola, ${req.session.user.username}! Has iniciado sesión correctamente.`);
  } else {
    res.redirect('/');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
