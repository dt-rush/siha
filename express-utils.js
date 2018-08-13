'use strict';

// helper method to handle errors
exports.errorHandler = (req) => (err) => {
  console.error(`got error when processing request: ${req.method} ${req.path}`);
  if (config.debug) {
    console.error(`payload: ${JSON.stringify(req.body)}`);
  }
  console.error(err);
};

// helper method to respond to requests with a promise
exports.respond = (req, res, promise) => {
  promise
    .then((result) => {
      res.send(result);
    })
    .catch(exports.errorHandler(req));
};


