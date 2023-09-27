module.exports = {
    dashboard: (req, res) => {
    if (req.session.user) {
        res.send(`¡Hola, ${req.session.user.username}! Has iniciado sesión correctamente.`);
    } else {
        res.redirect('/');
    }
  }
}