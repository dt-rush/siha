'use strict';

const express = require('express');
const Sequelize = require('sequelize');
const { sequelize } = require('./db');
const config = require('./config');
const restify = require('./restify').prefix(config.apiPrefix);

exports.Todo = restify.restify(['post', 'get', 'patch', 'delete'],
  sequelize.define('todo', {
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
  })
);

exports.Daily = restify.restify(['post', 'get', 'patch', 'delete'],
  sequelize.define('daily', {
    id: { 
      type: Sequelize.INTEGER, 
      primaryKey: true,
      autoIncrement: true
    },
    name: Sequelize.STRING,
    description: Sequelize.STRING,
  })
);

exports.DailyLog = restify.restify(['post', 'get', 'delete'],
  sequelize.define('dailyLog', {
    id: { 
      type: Sequelize.INTEGER, 
      primaryKey: true,
      autoIncrement: true
    },
    date: Sequelize.DATEONLY,
  })
);

exports.Project = restify.restify(['post', 'get', 'patch', 'delete'],
  sequelize.define('project', {
    id: { 
      type: Sequelize.INTEGER, 
      primaryKey: true,
      autoIncrement: true
    },
    name: Sequelize.STRING,
  })
);

exports.ProjectLog = restify.restify(['post', 'get', 'delete'],
  sequelize.define('projectLog', {
    id: { 
      type: Sequelize.INTEGER, 
      primaryKey: true,
      autoIncrement: true
    },
    dateTime: Sequelize.DATE,
    duration: Sequelize.INTEGER,
  })
);

exports.Tag = restify.restify(['post', 'get', 'patch', 'delete'],
  sequelize.define('tag', {
    id: { 
      type: Sequelize.INTEGER, 
      primaryKey: true,
      autoIncrement: true
    },
    name: Sequelize.STRING,
  })
);

exports.Comment = restify.restify(['post', 'get', 'patch', 'delete'],
  sequelize.define('comment', {
    id: { 
      type: Sequelize.INTEGER, 
      primaryKey: true,
      autoIncrement: true
    },
    content: Sequelize.STRING,
  })
);

sequelize.sync();
