const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Importo los controladores.

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

router.post('/register', userController.register);
router.post('/confirmacion', userController.confirmacion);
router.post('/login', userController.login);
router.get('/dashboard', userController.dashboard);// Ruta del panel de control después del inicio de sesión exitoso. En realidad aqui se debe seguir el link al portal con las historias clínicas.
router.post('/recuperacion', userController.recuperacion);
router.post('/nuevaContrasena', userController.nuevaContrasena);

module.exports = router;
