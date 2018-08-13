'use strict';

const Sequelize = require('sequelize');

const config = require('./config');

const sequelize = new Sequelize('siha', config.username, 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  storage: config.db.storage,
  operatorsAliases: false,
});

const Task = sequelize.define('task', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  type: Sequelize.STRING
});

const models = [Task];

const withDB = (func) => {
  sequelize.sync().then(func);
}

const clearDB = () => {
  for (var model of models) {
    model.destroy({
      where: {},
      truncate: true
    });
  }
};

module.exports = {
  sequelize,
  withDB,
  clearDB,
  models,
  Task,
};
