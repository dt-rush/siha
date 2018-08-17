'use strict';

const { restifyRequestTest, restifyMethodTest } = require('./restify-test-utils');
const model = require('../lib/model');

for (var m of Object.values(model)) {
  restifyMethodTest(m);
  restifyRequestTest(m);
}
