'use strict';

const config = require('./config');
const { randomErrorDescription } = require('./fun');

// helper method to print request info
exports.logRequestData = (req) => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    console.error(`query: ${JSON.stringify(req.query)}`);
  } else if (req.method === 'POST' || req.method === 'PATCH') {
    console.error(`body: ${JSON.stringify(req.body)}`);
  }
}

// helper method to handle internal errors
exports.internalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(`internal error when processing request: ${req.method} ${req.path}`);
  if (config.debug) {
    exports.logRequestData(req);    
  }
  console.error(err);
  return res.status(err.status || 500).send({
    error: `uh oh... ${randomErrorDescription()}`
  });
};

// helper method to send the client error replies
exports.respondError = (req, res, err) => {
  console.error(`client error when processing request: ${req.method} ${req.path}`);
  if (config.debug) {
    exports.logRequestData(req);    
  }
  console.error(err);
  res.send({
    error: err.message
  });
}

// helper method to respond to requests with a promise
exports.respond = (req, res, next, promise) => {
  promise
    .then((result) => {
      res.send(result);
    })
    .catch(next);
};


