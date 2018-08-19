exports.db = require('../lib/db');
exports.relations = require('../lib/relations');
exports.model = require('../lib/model');

require('dotenv').config({path: '../dev.env'});
exports.start = (afterSync) => {
  exports.db.sequelize.sync({
    hooks: {afterSync}
  });
};
