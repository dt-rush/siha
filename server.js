'use strict';

const express = require('express');
const morgan = require('morgan');

const dotenv = require('dotenv');
dotenv.config({
  path: './env.env'
});

const config = require('./config');
const api = require('./api');
const { internalErrorHandler } = require('./express-utils');

const app = express();
app.use(morgan('combined', {immediate: true}));
app.use('/api', api.router);
app.use(internalErrorHandler);
app.listen(config.port, () => console.log(`siha listening on port ${config.port}!`));
