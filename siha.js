exports.db = require('./lib/db');
exports.relations = require('./lib/relations');
exports.model = require('./lib/model');

require('dotenv').config({path: './dev.env'});

exports.start = () => new Promise((resolve, reject) => {
  exports.db.sequelize.sync()
    .then(resolve)
    .catch(reject);
});
