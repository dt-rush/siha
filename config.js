'use strict';

module.exports = {
  username: process.env.SIHA_USER || "anon",
  port: process.env.SIHA_PORT || 3000,
  debug: process.env.SIHA_DEBUG || false,
  db: {
    storage: process.env.SIHA_DBFILE
  }
};
