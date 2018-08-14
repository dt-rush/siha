'use strict';

const express = require('express');
const morgan = require('morgan');

const config = require('./config');
const api = require('./api');
const { internalErrorHandler } = require('./express-utils');

const app = express();
app.use(morgan('combined', {immediate: true}));
app.use('/api', api.router);
app.use(internalErrorHandler);
app.listen(config.port, () => {
  if (process.env.NODE_ENV !== 'test') { 
    console.log(require('./jgs-flower-banner'));
    console.log();
    console.log(`siha listening on port ${config.port}!`)
  }
});

module.exports = app;
