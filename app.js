const express = require('express');
const routes = require('./routes/routes'); // Iimporto las rutas
const middleware = require('./middlewares/middleware'); // Importo los middlewares

const app = express();

const PORT = process.env.PORT; // Variable de entorno para determinar el puerto de ejecución.

app.use(express.static(__dirname));

app.use(middleware); // Utilizando los Middlewares

app.use('/', routes); // Utilizando las rutas

app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});

