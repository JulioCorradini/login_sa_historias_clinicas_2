const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
    // Variables de entorno con las credenciales de una Base de Datos de prueba en mi localhost
    host: process.env.DB_HOST_LOCAL,
    user: process.env.DB_USER_LOCAL,
    password: process.env.DB_PASS_LOCAL,
    database: process.env.DB_NAME_LOCAL

  });

  module.exports = db;