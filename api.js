'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const siha = require('./siha');
const { errorHandler, respond } = require('./express-utils');

const api = module.exports = {
  router: express.Router(),
};

api.router.use(bodyParser.json());

api.router.post('/tasks', (req, res) => {
  respond(req, res, siha.createTask(req.body));
});

api.router.get('/tasks', (req, res) => {
  respond(req, res, siha.readTasks(req.body));
});

api.router.patch('/task/:id', (req, res) => {
  respond(req, res, siha.updateTask(req.params.id, req.body));
});
