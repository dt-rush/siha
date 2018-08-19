'use strict';

const config = require('./config');

module.exports = (server) => {
  const port = server.address().port;
  return [
    require('./jgs-flower-banner'),
    `siha listening on port ${port}!` 
  ].join('\n');
}
