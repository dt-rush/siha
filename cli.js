#!/usr/bin/env node

'use strict';

const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

const repl = require('repl');
const JSON5 = require('json5')
const siha = require('./siha');

siha.start().then(() => {

  const replServer = repl.start({
    prompt: "siha > ",
  });

  const context = replServer.context;
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

  replServer.defineCommand('help', {
    help: 'explain how to use the CLI',
    action: commandAction(async () => {
      return console.log(helpText);
    })
  });

  replServer.defineCommand('models', {
    help: 'list the models',
    action: commandAction(async () => {
      return console.log(models);
    })
  });

  models.forEach((model) => {

    const methods = model.restify().supportedMethods;
    replServer.defineCommand(model.name, {
      help: `manipulate ${model.name} objects`,
      action: commandAction((...args) => {
        if (args[0] === '') {
          methods.forEach((method) => {
            console.log(`${model.name} ${method} ...`);
          });
        } else {
          const re = /(\w+)(\s+(.*))?/;
          const match = args[0].match(re);
          if (!match) {
            console.error(`".${model.name} ${args[0]}" did not match ${re}`);
          } else {
            const method = RegExp.$1;
            if (!(methods.includes(method))) {
              console.error(`${method} not a valid method for ${model.name}. Run ".${model.name}" to see valid methods.`);
            } else {
              const rest = RegExp.$3;
              const payload = rest ? JSON5.parse(rest) : {};
              return model.restify()[method](payload)
                .then(modelMethodThen(method));
            }
          }
        }
      }) 
    });

  });

});
