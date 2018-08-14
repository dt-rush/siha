'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();

const { Todo } = require('../model');
const { clearDB } = require('../db');
const { assertRetrievedIsTodo } = require('./utils');

chai.use(chaiHttp);

describe('Api/Todo', () => {

  beforeEach(clearDB);

  it('POST /api/todos', (done) => {

    const todo = {
      name: 'make the bed',
      description: 'the first victory of the day'
    };

    chai.request(app)
      .post('/api/todos')
      .send(todo)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        assertRetrievedIsTodo(res.body, todo);
        done();
      });
  });

  it('GET /api/todos', (done) => {

    const todo = {
      name: 'make the bed',
      description: 'the first victory of the day'
    };

    Todo.rest().post(todo)
      .then(() => {
        chai.request(app)
          .get('/api/todos')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            assertRetrievedIsTodo(res.body[0], todo);
            done();
        });
      });

  });

});
