'use strict';

const express = require('express');

const dotenv = require('dotenv');
dotenv.config({
  path: './env.env'
});

const config = require('./config');
const api = require('./api');

const app = express();
app.use('/api', api.router);
app.listen(config.port, () => console.log(`siha listening on port ${config.port}!`));
