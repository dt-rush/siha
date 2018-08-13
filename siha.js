'use strict';

exports.createTask = (task) => {
  console.log('### create:');
  console.log(task);
  return new Promise((resolve, reject) => {
    resolve(null);
  });
};

exports.readTasks = (query) => {
  console.log('### read:');
  console.log(query); 
  return new Promise((resolve, reject) => {
    resolve(null);
  });
};

exports.updateTask = (id, task) => {
  console.log('### update:');
  console.log(id);
  console.log(task);
  return new Promise((resolve, reject) => {
    resolve(null);
  });
};
