'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const siha = require('./siha');
const { respond, respondError } = require('./express-utils');

const api = module.exports = {
  router: express.Router(),
};

api.router.use(bodyParser.json());

api.router.post('/tasks', (req, res, next) => {
  respond(req, res, next, siha.createTask(req.body));
});

api.router.patch('/task/:id', (req, res, next) => {
  respond(req, res, next, siha.updateTask(req.params.id, req.body));
});

api.router.get('/tasks', (req, res, next) => {
  respond(req, res, next, siha.getTasks(req.query));
});

api.router.delete('/tasks', (req, res, next) => {
  if (Object.keys(req.query).length === 0) {
    respond(req, res, next, siha.deleteTasks()); 
  } else {
    // attempt to parse the query as a comma-separated list of ID's
    if (/^[0-9]+(,[0-9]+)*$/.test(req.query.ids)) {
      const ids = req.query.ids.split(',');
      respond(req, res, next, siha.deleteTasks(ids));
    } else {
      respondError(req, res, new Error(`query "${req.query.ids}" did not match /^[0-9]+(,[0-9]+)*$/`));
    }
  }
});


