const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true,
  })
);

module.exports = app;
