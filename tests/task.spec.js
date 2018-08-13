'use strict';

const { assert } = require('chai');

const siha = require('../siha');
const { withDB, clearDB, Task } = require('../db');
const { assertRetrievedIsTask } = require('./utils');

describe('Task', () => {

  beforeEach(clearDB);

  it('should create a task properly', async () => {

    const task = {
      name: 'make the bed',
      description: 'the first victory of the day',
      type: 'daily,todo'
    };

    console.log(`dbfile is: ${process.env.SIHA_DBFILE}`);

    const created = await siha.createTask(task);
    assert.property(created, 'id');
    assertRetrievedIsTask(created, task);
    const fromDB = await Task.findById(created.id);
    assert.property(fromDB, 'id');
    assertRetrievedIsTask(fromDB, task);

  });

  it('should update a task properly', async () => {

    const task = {
      name: 'exercise',
      description: '[socrates quote]',
      type: 'daily,todo'
    };
    const patch = {
      description: 'No citizen has a right to be an amateur in the matter of physical training…what a disgrace it is for a man to grow old without ever seeing the beauty and strength of which his body is capable.'
    };

    const created = await siha.createTask(task);
    let fromDB = await Task.findById(created.id);
    const patched = await siha.updateTask(created.id, patch);
    assertRetrievedIsTask(patched, Object.assign(task, patch));
    fromDB = await Task.findById(created.id);
    assertRetrievedIsTask(fromDB, Object.assign(task, patch));

  });


});
