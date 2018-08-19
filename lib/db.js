'use strict';

const Sequelize = require('sequelize');

const config = require('./config');

const sequelize = new Sequelize('siha', config.username, 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  storage: config.db.storage,
  // TODO: set to false once https://github.com/brpx/node-sequelize-querystring/pull/7
  // is merged to master.
  operatorsAliases: true,
});

const withDB = (func) => {
  sequelize.sync().then(func);
}

const clearDB = () => {
  for (var model of Object.values(sequelize.models)) {
    model.destroy({
      where: {},
      truncate: true
    }).catch((err) => {
      if (/.*no such table.*/.test(err.message)) {
        // ignore no such table
        return; 
      }
      console.error(`error in db.js: clearDB(): ${err.message}`);
      if (config.debug) {
        console.error(err);
      }
    });
  }
};

module.exports = {
  sequelize,
  withDB,
  clearDB,
};
