'use strict';

const Sequelize = require('sequelize');
const { sequelize } = require('./db');
const { restify } = require('./rest');

exports.Todo = restify(sequelize.define('todo', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}));

exports.Daily = restify(sequelize.define('daily', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  description: Sequelize.STRING,
}));

exports.DailyLog = restify(sequelize.define('dailyLog', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  date: Sequelize.DATEONLY,
}));

exports.Project = restify(sequelize.define('project', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
}));

exports.ProjectLog = restify(sequelize.define('projectLog', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  dateTime: Sequelize.DATE,
  duration: Sequelize.INTEGER,
}));

exports.Tag = restify(sequelize.define('tag', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
}));

exports.Comment = restify(sequelize.define('comment', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  content: Sequelize.STRING,
}));
