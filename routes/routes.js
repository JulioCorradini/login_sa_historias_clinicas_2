const express = require('express');
const router = express.Router();
const userControllerRegister = require('../controllers/userControllerRegister'); // Importo el controlador para la ruta /register.
const userControllerLogin = require('../controllers/userControllerLogin'); // Importo el controlador para la ruta /login.
const userControllerConfirmacion = require('../controllers/userControllerConfirmacion'); // Importo el controlador para la ruta /confirmacion.
const userControllerDashboard = require('../controllers/userControllerDashboard'); // Importo el controlador para la ruta /dashboard.
const userControllerRecuperacion = require('../controllers/userControllerRecuperacion'); // Importo el controlador para la ruta /recuperacion.
const userControllerNuevaContrasena = require('../controllers/userControllerNuevaContrasena'); // Importo el controlador para la ruta /nuevaContrasena.
const userControllerRegex = require('../controllers/userControllerRegex'); // Importo el controlador para la ruta /regex.

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

router.post('/register', userControllerRegister.register);
router.post('/confirmacion', userControllerConfirmacion.confirmacion);
router.post('/login', userControllerLogin.login);
router.get('/dashboard', userControllerDashboard.dashboard);// Ruta del panel de control después del inicio de sesión exitoso. En realidad aqui se debe seguir el link al portal con las historias clínicas.
router.post('/recuperacion', userControllerRecuperacion.recuperacion);
router.post('/nuevaContrasena', userControllerNuevaContrasena.nuevaContrasena);
router.get('/regex', userControllerRegex.regex);

module.exports = router;
