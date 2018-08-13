'use strict';

const chai = require('chai');

// asserts that the key-values in task are in retrieved
exports.assertRetrievedIsTask = (retrieved, task) => {
  for (var key of Object.keys(task)) {
    chai.assert.strictEqual(retrieved[key], task[key], `${key} matches`);
  };
}
