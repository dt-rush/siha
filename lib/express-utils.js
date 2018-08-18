'use strict';

/** @module express-utils */

const config = require('./config');
const { randomErrorDescription } = require('./fun');

/** @function
 * @description helper function to handle internal errors
 * @param err {Error} - the error which was caught
 * @param req {express.Request} - the request
 * @param res {express.Response} - the response
 * @param next {Function} - the express middleware next() callback
 */
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

/** @function
 * @description helper function to send the client error replies
 * @param req {express.Request} - the request
 * @param res {express.Response} - the response
 * @param err {Error} - the error which was caught
 */
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

/** @function
 * @description helper function to respond to requests with a promise
 * @param req {express.Request} - the request
 * @param res {express.Response} - the response
 * @param next {Function} - the express middleware next() callback
 * @param promise {Promise} - the promise whose resolved value will be sent
 */
exports.respond = (req, res, next, promise) => {
  promise
    .then((result) => {
      res.send(result);
    })
    .catch(next);
};
