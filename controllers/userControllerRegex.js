const regex = require('../regex/regex'); // Importa la variable con el regex.

module.exports = {
    regex: async (req, res) => {
        res.json({ regex: regex });
      }
};