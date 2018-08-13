'use strict';

const { withDB, Task } = require('./db');

const { Op } = require('sequelize');

exports.createTask = (task) => {
  console.log('### create task:');
  console.log(task);
  return new Promise((resolve, reject) => {
    withDB(() => {
      Task.create(task)
        .then(resolve)
        .catch(reject);
    });
  });
};

exports.updateTask = (id, patch) => {
  console.log('### update task:');
  console.log(id);
  console.log(patch);
  return new Promise((resolve, reject) => {
    Task.findById(id).then((task) => {
      task.update(patch)
        .then(resolve)
        .catch(reject);
    });
  });
};

exports.getTasks = (query) => {
  console.log('### read tasks:');
  console.log(query);
  if (Object.keys(query).length === 0) {
    console.log('no query');
  }
  return Task.findAll(query);
};

exports.deleteTasks = (ids) => {
  console.log('### delete tasks:');
  console.log(ids);
  // build a query object the likes of which sequelize expects
  const query = {
    where: {
      [Op.or]: ids.map((id) => ({"id": id}))
    }
  };
  return new Promise((resolve, reject) => {
    Task.destroy(query)
      .then((deleted) => {
        resolve({deleted});
      })
      .catch(reject);
  });
};


