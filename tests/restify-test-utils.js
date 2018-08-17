'use strict';

/** @module tests/restify-test-utils */

const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, server } = require('../lib/app');
const should = chai.should();

chai.use(chaiHttp);

const restify = require('../lib/restify');
const { clearDB } = require('../lib/db');
const { assertRetrievedIsObj } = require('./utils');
const testdata = require('./testdata');

/** @constant
 * @type {Object}
 * @description keys are request methods like 'post', 'get', values are
 *  functions of type (model) => (requester, testdata) => async ()
 */
const requestTests = {

  post: (model) => (requester, { simple }) => async () => {

    const res = await requester.post(model.restify().paths.post()).send(simple);
    res.should.have.status(200);
    res.body.should.be.a('object');
    res.body.should.have.property('id');
    assertRetrievedIsObj(res.body, simple);

  },

  get: (model) => (requester, { simple }) => async () => {

    await model.restify().post(simple);
    const res = await requester.get(model.restify().paths.get())
    res.should.have.status(200);
    res.body.should.be.a('array');
    assertRetrievedIsObj(res.body[0], simple);

  },

  patch: (model) => (requester, { simple, patch }) => async () => {

    const savedInstance = await model.restify().post(simple);
    const patchRes = await requester.patch(savedInstance.restify().paths.patch()).send(patch);
    patchRes.should.have.status(200);
    patchRes.body.should.be.a('object');
    assertRetrievedIsObj(patchRes.body, Object.assign(simple, patch));
    const getRes = await requester.get(model.restify().paths.get());
    assertRetrievedIsObj(getRes.body[0], Object.assign(simple, patch));

  },

  delete: (model) => (requester, { simple }) => async () => {

    const savedInstance = await model.restify().post(simple)
    const deleteRes = await requester.delete(savedInstance.restify().paths.delete());
    deleteRes.should.have.status(200); 
    const getRes = await requester.get(model.restify().paths.get())
    getRes.body.should.be.a('array');
    getRes.body.should.have.length(0);

  }

};

// perform tests on the API's, on support methods, for a single model
exports.restifyRequestTest = (model) => {

  const modelName = model.name.replace(/\b\w/g, l => l.toUpperCase());
  const simpleTestData= testdata.simple[modelName];
  const requester = chai.request(app).keepOpen();
   
  const testsToRun = {};
  for (var method of model.restify().supportedMethods) {
    if (!testsToRun[method]) {
      testsToRun[method] = [];
    }
    if (Array.isArray(requestTests[method])) {
      testsToRun[method] = testsToRun[method].concat(requestTests[method]); 
      testsToRun[method].concat(requestTests[method]); 
    } else {
      testsToRun[method].push(requestTests[method]);
    }
  }

  describe(`restify::api::${modelName}`, () => {

    beforeEach(clearDB);

    after((done) => {
      requester.close();
      server.close();
      done();
    });

    for (var method of Object.keys(testsToRun)) {
      for (var test of testsToRun[method]) {
        const descriptor = `${method.toUpperCase()} ${model.restify().paths[method]()}`;
        it(descriptor, test(model)(requester, simpleTestData));
      }
    }

  });


};

const methodTests = {

  post: (model) => ({ simple }) => async () => {

    const created = await model.restify().post(simple);
    created.should.have.property('id');
    assertRetrievedIsObj(created, simple);
    const fromDB = await model.findById(created.id);
    fromDB.should.have.property('id');
    assertRetrievedIsObj(fromDB, simple);

  },

  get: [
  
    (model) => ({ simple }) => async() => {
  
      await model.restify().post(simple);
      let fromDB = await model.restify().get();
      fromDB.should.be.a('array');
      fromDB.should.have.length(1);
      assertRetrievedIsObj(fromDB[0], simple);

    },

    (model) => ({ simple }) => async() => {
      
      const n = 8;
      for (let i = 0; i < n; i++) {
        await model.restify().post(simple);
      }
      const fromDB = await model.findAll();
      fromDB.should.be.a('array');
      fromDB.should.have.length(n);
      for (let i = 0; i < n; i++) {
        assertRetrievedIsObj(fromDB[i], simple);
      }

    }

  ],

  patch: (model) => ({ simple, patch }) => async() => {

    const created = await model.restify().post(simple);
    let fromDB = await model.findById(created.id);
    const patched = await model.restify().patch(created.id, patch);
    assertRetrievedIsObj(patched, Object.assign(simple, patch));
    fromDB = await model.findById(created.id);
    assertRetrievedIsObj(fromDB, Object.assign(simple, patch));

  },

  delete: [

    (model) => ({ simple }) => async() => {

      const a = await model.restify().post(simple);
      const b = await model.restify().post(simple);
      let fromDB = await model.findAll();
      await model.restify().delete([fromDB[0].id]);
      fromDB = await model.findAll();
      fromDB.should.be.a('array');
      fromDB.should.have.length(1);

    },

    (model) => ({ simple }) => async() => {
  
      const n = 16;
      const promises = [];
      for (var i = 0; i < n; i++) {
        promises.push(model.restify().post(simple));
      }
      await Promise.all(promises);
      await model.restify().delete();
      const fromDB = await model.findAll();
      fromDB.should.be.a('array');
      fromDB.should.have.length(0);

    }

  ],

};

// perform tests on supported rest method functions for a single model
exports.restifyMethodTest = (model) => {

  const modelName = model.name.replace(/\b\w/g, l => l.toUpperCase());
  const simpleTestData = testdata.simple[modelName];

  const testsToRun = {};

  for (var method of model.restify().supportedMethods) {
    if (!testsToRun[method]) {
      testsToRun[method] = [];
    }
    if (Array.isArray(methodTests[method])) {
      testsToRun[method] = testsToRun[method].concat(methodTests[method]); 
    } else {
      testsToRun[method].push(methodTests[method]);
    }
  }

  describe(`restify::methods::${modelName}`, () => {

    beforeEach(clearDB);

    for (var method of Object.keys(testsToRun)) {
      for (var test of testsToRun[method]) {
        const descriptor = `${model.name}.${method}()`;
        it(descriptor, test(model)(simpleTestData));
      }
    }

  });

};
