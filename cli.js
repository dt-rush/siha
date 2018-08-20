#!/usr/bin/env node

'use strict';

const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

const async = require('async');
const repl = require('repl');
const JSON5 = require('json5')
const siha = require('./siha');

siha.start().then(() => {

  const replServer = repl.start({
    prompt: "siha > ",
  });

  const context = replServer.context;
  context.siha = siha;
  const models = Object.values(siha.model);
  models.forEach((model) => {
    replServer.context[model.name] = model;
  });

  const helpText = `

    SIHA CLI
    ===

    Commands:

    .help
    .models
    .{model} [ get | post | patch | delete ] {payload}

  `;

  const commandAction = (fn) => {
    return function (...args) {
      fn(...args)
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          this.displayPrompt();
        });
    };
  };

  // attempts a series of command funcs which can either return a promise
  // or undefined (they exit early if the cli input doesn't match their regex)
  const commandMatch = (arg, series) => { 
    return new Promise((resolve, reject) => {
      for (var func of series) {
        let result;
        try {
          result = func(arg);
        } catch (err) {
          return reject(err);
        }
        if (result) {
          return result
            .then(resolve)
            .catch(reject);
        }
      }
      reject(`no command regex matched input: ${arg}`);
    });
  };

  // .then() handlers for methods on models
  const modelMethodThen = (method) => (result) => {
    const handlers = {
      post: (result) => {
        console.log('posted.');
        console.log(result.dataValues);
      },
      get: (result) => {
        console.log(result.rows.map((instance) => instance.dataValues));
      },
      patch: (result) => {
        console.log('patched.');
        console.log(result.dataValues);
      },
      delete: (result) => {
        console.log('deleted.');
      },
    };
    handlers[method](result);
  };

  // help command
  replServer.defineCommand('help', {
    help: 'explain how to use the CLI',
    action: commandAction(async () => {
      return console.log(helpText);
    })
  });

  // helper command to list models
  replServer.defineCommand('models', {
    help: 'list the models',
    action: commandAction(async () => {
      return console.log(models);
    })
  });

  const defaultMethodHandler = (model) => (arg) => {
    const methods = model.restify().supportedMethods;
    // .{model} {method} {payload}
    const supportedMethodsPattern = model.restify().supportedMethods.join('|');
    const commandRegExp = new RegExp(`(${supportedMethodsPattern})(\\s+(.*))?`);
    const match = arg.match(commandRegExp);
    if (match) {
      const method = RegExp.$1;
      if (!(methods.includes(method))) {
        callback(new Error(`${method} not a valid method for ${model.name}. ` +
          `Run ".${model.name}" to see valid methods.`));
      }
      const rest = RegExp.$3;
      const payload = rest ? JSON5.parse(rest) : {};
      return model.restify()[method](payload)
        .then(modelMethodThen(method));
    }
  }

  const createInstanceByName = (model) => (arg) => {
    // .{model} {name}
    const commandRegExp = /(.+)/;
    const match = arg.match(commandRegExp);
    // ignore if "name" is a method
    if (match &&
        !model.restify().supportedMethods.includes(RegExp.$1)) {
      const payload = { name: RegExp.$1 };
      return model.restify().post(payload)
        .then(modelMethodThen('post'));
    }
  }
  
  // add a cliHandlers list to each model
  for (var model of models) {
    model.cliHandlers = [];
  }

  // add special DONE handler to todo, that patches complete: true
  siha.model.Todo.cliHandlers.push((arg) => {
    // .{model} {name}
    const commandRegExp = /([0-9]+)\s+(.+)/;
    const match = arg.match(commandRegExp);
    if (match) {
      const payload = { id: RegExp.$1, patch: JSON5.parse(RegExp.$2) };
      return siha.model.Todo.restify().patch(payload)
        .then(modelMethodThen('patch'));
    }
  });

  // add createInstanceByName handler for specific models
  const modelsWithName = [
    siha.model.Todo, 
    siha.model.Daily, 
    siha.model.Project, 
    siha.model.Tag
  ];
  modelsWithName.forEach((model) => {
    model.cliHandlers.push(createInstanceByName(model));
  });

  // add default handler to each model
  for (var model of models) {
    model.cliHandlers.push(defaultMethodHandler(model));
  };

  // add commands to the replServer for each model
  models.forEach((model) => {

    replServer.defineCommand(model.name, {
      help: `manipulate ${model.name} objects`,
      action: commandAction(async (arg) => {
        if (arg === '') {
          return model.restify().get().then(modelMethodThen('get'));
        }
        return commandMatch(arg, model.cliHandlers); 
      }) 
    });

  });

});



        
