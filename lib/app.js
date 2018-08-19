'use strict';

const express = require('express');
const morgan = require('morgan');

const config = require('./config');
const serverMotd = require('./server-motd');
const api = require('./api');
const { internalErrorHandler } = require('./express-utils');

const app = express();
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {immediate: true}));
}
app.use(api.router);
app.use(internalErrorHandler);

// create the db, add the models, sync, and then start listening
const db = require('./db');
const model = require('./model');
module.exports = new Promise((resolve, reject) => {
  db.sequelize.sync().then(() => {
    // start listening
    const server = app.listen(config.port, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      // on success, print the server start banner and resolve
      if (process.env.NODE_ENV !== 'test') {
        console.log(serverMotd(server)); 
      }
      resolve({app, server})
    });
  });
});
