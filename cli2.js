#!/usr/bin/env node

'use strict';

const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

const JSON5 = require('json5')
const inquirer = require('inquirer');

const siha = require('./siha');

siha.start().then(() => {

  console.log(require('./lib/jgs-flower-banner'));

  const modelChoices = [
    'Todo',
    'Daily',
    'Project',
    'Tag'
  ];

  const promptType = async () => {
    const { type } = await inquirer.prompt([{
      type: 'list',
      name: 'type',
      message: 'select a type to interact with',
      choices: modelChoices
    }]);
    return type;
  };

  const promptField = async (type, fieldName) => {
    const { value } = await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: `${type}.${fieldName}:`
    }]);
    return value;
  };

  const doList = async (type) => {
    const results = await siha.model[type].restify().get();
    const rows = results.rows.map(row => row.dataValues);
    console.log(rows);
  };

  const doCreate = async (type) => {
    obj = {};
    for (fieldName of Object.keys(siha.schema[type])) {
      obj[fieldName] = await promptField(type, fieldName); 
    }
    return siha.model[type].restify().post(obj);
  };

  const promptObjByID = async (type) => {
    // get ID of object
    let validID = false;
    let obj;
    while (!validID) {
      const id = await promptField(type, 'id');
      const result = await siha.model[type].restify().get({
        filter: `id = ${id}`
      });
      if (result.rows.length === 0) {
        console.log('No such id.');
      } else {
        obj = result.rows[0].dataValues;
        validID = true;
      }
    }
    return obj
  };

  const promptPatchObj = async (type, obj) => {
    let validPatch = false;
    let patch;
    while (!validPatch) {
      const promptName = `edit ${type} ${obj.id}`;
      const result = await inquirer.prompt([{
        type: 'editor',
        name: promptName,
        default: JSON5.stringify(obj, { space: 2 })
      }]);
      try {
        patch = JSON5.parse(result[promptName]);
        validPatch = true;
      } catch (e) {
        // if we're here, we didn't set validPatch
      }
    }
    // send patch
    return siha.model[type].restify()
      .patch({
        id: obj.id,
        patch: patch
      })
      .then(() => console.log('Modified.'))
      .catch(() => {
        console.error('Invalid object specified - check syntax carefully');
        promptPatchObj(type, obj);
      });
  }

  const doModify = async (type) => {
    const obj = await promptObjByID(type);
    return promptPatchObj(type, obj); 
  };

  const doDelete = async (type) => {
    const id = await promptField(type, 'id');
    return siha.model[type].restify().delete({
      ids: [id]
    });
  };

  const operationMap = {
    'list': doList,
    'create': doCreate,
    'modify': doModify,
    'delete': doDelete,
  };

  const promptOperation = async () => {
    const { operation } = await inquirer.prompt([{
      type: 'list',
      name: 'operation',
      message: 'what would you like to do?',
      choices: Object.keys(operationMap)
    }]);
    return operation;
  };

  const ask = async () => {
    const type = await promptType();
    const operation = await promptOperation();
    operationMap[operation](type)
      .catch(console.error)
      .finally(ask);
  };

  ask();

});



        
