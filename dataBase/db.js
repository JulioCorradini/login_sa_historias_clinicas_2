const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
    // Variables de entorno con las credenciales de una Base de Datos de prueba en mi localhost
    host: process.env.DB_HOST_LOCAL,
    user: process.env.DB_USER_LOCAL,
    password: process.env.DB_PASS_LOCAL,
    database: process.env.DB_NAME_LOCAL
  
  
    // Estas son las varirables de entorno con las credenciales de una Base de Datos de prueba en el servidor de freesqldatabase.com
    //App deployada para test en el servidor gratuito de render.com. Se accede mediante el link https://login-sa.onrender.com/
    //La base de datos de freesqldatabase.com se puede visualizar accediendo al link https://www.phpmyadmin.co con las correspondientes credenciales.
    /*host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME*/
  });

  module.exports = db;