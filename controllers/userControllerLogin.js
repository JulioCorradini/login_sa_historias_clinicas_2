const bcrypt = require('bcrypt');
const db = require('../dataBase/db'); // Importa la instancia de conexión a la base de datos desde db.js
require('dotenv').config(); // Se traen las variables de entorno del archvio .env

module.exports = {
    login: (req, res) => {
        const { username, password } = req.body;
        db.query(
          'SELECT * FROM users WHERE username = ?',
          [username],
          async (err, result) => {
            if (err || result.length === 0) {
              res.redirect('/index/indexLoginError.html');
            } else {
              const isPasswordValid = await bcrypt.compare(password, result[0].password);
              if (isPasswordValid) {
                req.session.user = result[0];
                res.redirect('/dashboard'); // Aquí la acción tiene que ser la de seguir el link que redirige al portal con las historias clínicas.
              } else {
                res.redirect('/index/indexLoginError.html');
              }
            }
          }
        );
    }
}