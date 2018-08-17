'use strict';

const chai = require('chai');

// asserts that the key-values in todo are in retrieved
const assertRetrievedIsObj = exports.assertRetrievedIsObj = (retrieved, obj) => {
  for (var key of Object.keys(obj)) {
    chai.assert.strictEqual(retrieved[key], obj[key], `${key} matches`);
  };
}
