'use strict';

const { restifyRequestTest, restifyMethodTest } = require('./restify-test-utils');
const models = Object.values(require('../lib/model'));

describe('restify-tests', () => {

  it('do method tests', async () => {

    await Promise.all(models.map(restifyMethodTest));

  });

  it('do request tests', async () => {
  
    const { app, server } = await require('../lib/app');
    await Promise.all(models.map(restifyRequestTest(app, server)));

  });

});
