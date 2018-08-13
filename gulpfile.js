const gulp = require('gulp');
const gls = require('gulp-live-server');
const dotenv = require('dotenv');
const mocha = require('gulp-spawn-mocha');

const CI = process.env.CI === 'true';
const DEBUG = process.env.DEBUG === 'true';

gulp.task('test', () => {
  dotenv.config({
    path: './test.env'
  });
  gulp.src('./tests/*.spec.js', {read: false})
    .pipe(mocha({
      env: process.env,
      debugBrk: DEBUG,
      R: CI ? 'spec' : 'nyan',
      istanbul: !DEBUG
    }));
});

gulp.task('dev-serve', () => {

  // we will replace this server object with each reload
  let server;

  // helper function used during reload
  const restartServer = async () => {
    dotenv.config({
      path: './dev.env'
    });
    if (server) {
      await server.stop();
    }
    server = gls('server.js', {env: process.env});
    server.start();
  };

  // start the server one time
  restartServer();

  // set up watchers
  gulp.watch(['*.js', 'dev.env'], () => {
    restartServer();
  });

});
