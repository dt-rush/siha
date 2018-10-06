require('dotenv').config({path: './dev.env'});

exports.db = require('./lib/db');
exports.relations = require('./lib/relations');
exports.schema = require('./lib/schema');
exports.model = require('./lib/model');

exports.start = () => new Promise((resolve, reject) => {
  exports.db.sequelize.sync()
    .then(resolve)
    .catch(reject);
});
