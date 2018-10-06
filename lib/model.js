'use strict';

const express = require('express');
const Sequelize = require('sequelize');

const { sequelize } = require('./db');
const config = require('./config');
const schema = require('./schema');
const restify = require('./restify').prefix(config.apiPrefix);

exports.Todo = restify.restify(
  ['post', 'get', 'patch', 'delete'],
  sequelize.define('todo', schema.Todo)
);

exports.Daily = restify.restify(
  ['post', 'get', 'patch', 'delete'],
  sequelize.define('daily', schema.Daily)
);

exports.DailyLog = restify.restify(
  ['post', 'get', 'delete'],
  sequelize.define('dailyLog', schema.DailyLog)
);

exports.Project = restify.restify(
  ['post', 'get', 'patch', 'delete'],
  sequelize.define('project', schema.Project)
);

exports.ProjectLog = restify.restify(
  ['post', 'get', 'delete'],
  sequelize.define('projectLog', schema.ProjectLog)
);

exports.Tag = restify.restify(
  ['post', 'get', 'patch', 'delete'],
  sequelize.define('tag', schema.Tag)
);

exports.Comment = restify.restify(
  ['post', 'get', 'patch', 'delete'],
  sequelize.define('comment', schema.Comment)
);
