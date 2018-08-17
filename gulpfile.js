const gulp = require('gulp');
const gls = require('gulp-live-server');
const dotenv = require('dotenv');
const mocha = require('gulp-spawn-mocha');
const jsdoc = require('gulp-jsdoc3');
const git = require('gulp-git');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

const CI = process.env.CI === 'true';
const DEBUG = process.env.DEBUG === 'true';

gulp.task('jsdoc', (done) => {
  var config = require('./jsdoc.config.json');
  gulp.src(['README.md', './lib/**/*.js'], {read: false})
      .pipe(jsdoc(config, done));
});

gulp.task('git-add-all', () => {
  return gulp.src('.')
    .pipe(git.add());
});

gulp.task('commit-version', (done) => {
  const newVersion = execSync('versionist get version').toString().trim();
  const newReference = execSync('versionist get reference').toString().trim();
  gulp.src('.', { read: false })
    .pipe(git.commit(`${newVersion}`))
    .pipe(git.tag(newReference, '', (err) => { 
      if (err) {
        throw err;
      } else {
        done();
      }
    }));
});

gulp.task('versionist-dry', (done) => {
  exec('versionist --dry', function (err, stdout, stderr) {
    done(err);
  });
});

gulp.task('versionist', (done) => {
  exec('versionist', function (err, stdout, stderr) {
    done(err);
  });
});

gulp.task('wait-one-second', (done) => {
  setTimeout(done, 1000);
});

gulp.task('push', function (done) {
  const headRef = execSync('git rev-parse --short HEAD').toString().trim();
  console.log(`pushing origin master in gulp with HEAD: ${headRef}`);
  exec('git push origin master', function (err, stdout, stderr) {
    done(err);
  });
});

const releaseTasks = [
  'versionist', 'jsdoc', 'git-add-all', 'commit-version', 'wait-one-second', 'push'
];

gulp.task('release', gulp.series(...releaseTasks));

gulp.task('test', () => {
  dotenv.config({
    path: './test.env'
  });
  return gulp.src('./tests/*.spec.js', {read: false})
    .pipe(mocha({
      env: process.env,
      debugBrk: DEBUG,
      R: CI ? 'spec' : 'nyan',
      istanbul: true,
      exit: true
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
    server = gls('./lib/app.js', {env: process.env});
    server.start();
  };
  // start the server one time
  restartServer();
  // set up watchers
  gulp.watch(['./lib/**/*.js', './dev.env'], () => {
    restartServer();
  });
});
