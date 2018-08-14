'use strict';

const chai = require('chai');

// asserts that the key-values in todo are in retrieved
exports.assertRetrievedIsTodo = (retrieved, todo) => {
  for (var key of Object.keys(todo)) {
    chai.assert.strictEqual(retrieved[key], todo[key], `${key} matches`);
  };
}
