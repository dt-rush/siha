'use strict';

module.exports = {
  username: "anon" || process.env.SIHA_USER,
  port: 3000 || process.env.SIHA_PORT,
  debug: false || process.env.SIHA_DEBUG
};
