'use strict';

const model = require('./model');
const config = require('./config');
const restify = require('./restify').prefix(config.apiPrefix);

module.exports = {
  router: restify.createAPIRouter(Object.values(model))
}
