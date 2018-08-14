'use strict';

const express = require('express');

const model = require('./model');
const { createREST } = require('./rest');

const api = module.exports = {
  router: express.Router(),
};

for (var m of Object.values(model)) {
  api.router.use(createREST(m));
}
