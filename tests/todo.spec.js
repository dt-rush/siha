'use strict';

const chai = require('chai');
const assert = chai.assert;
const should = chai.should();

const rest = require('../rest');
const { withDB, clearDB } = require('../db');
const { Todo } = require('../model');
const { assertRetrievedIsTodo } = require('./utils');

const todo = {
  name: 'make the bed',
  description: 'the first victory of the day',
  complete: false
};

describe('Todo', () => {

  beforeEach(clearDB);

  it('should post a todo properly', async () => {

    const created = await Todo.rest().post(todo);
    created.should.have.property('id');
    assertRetrievedIsTodo(created, todo);
    const fromDB = await Todo.findById(created.id);
    fromDB.should.have.property('id');
    assertRetrievedIsTodo(fromDB, todo);

  });

  it('should patch a todo properly', async () => {

    const todo = {
      name: 'exercise',
      description: '[socrates quote]',
      complete: false
    };
    const patch = {
      description: 'No citizen has a right to be an amateur in the matter of physical training…what a disgrace it is for a man to grow old without ever seeing the beauty and strength of which his body is capable.'
    };

    const created = await Todo.rest().post(todo);
    let fromDB = await Todo.findById(created.id);
    const patched = await Todo.rest().patch(created.id, patch);
    assertRetrievedIsTodo(patched, Object.assign(todo, patch));
    fromDB = await Todo.findById(created.id);
    assertRetrievedIsTodo(fromDB, Object.assign(todo, patch));

  });

  it('should get todos properly', async () => {

    const a = await Todo.rest().post(todo);
    const b = await Todo.rest().post(todo);
    const fromDB = await Todo.findAll();
    fromDB.should.be.a('array');
    fromDB.should.have.length(2);
    assertRetrievedIsTodo(fromDB[0], todo);
    assertRetrievedIsTodo(fromDB[1], todo);

  });

});
