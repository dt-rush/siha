'use strict';

/** @module restify */

const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
let sqs = require('sequelize-querystring');

const { sequelize, withDB } = require('./db');
const { respond, respondError } = require('./express-utils');

// use sqs in symbolicOps mode
sqs = sqs.withSymbolicOps(sequelize);


/*
 * A map keyed by [method] holding functions that, given a model, create a
 * function that takes params appropriate to REST method and returns a promise 
 * acting on that method for the given model (interfacing with the db)
 */
const methodFuncs = {

  post: (model) => (instance) => {
    return new Promise((resolve, reject) => {
      withDB(() => {
        model.create(instance)
          .then(resolve)
          .catch(reject);
      });
    });     
  },

  get: (model) => (query={}) => {
    const qObj = {
      offset: query.offset || 0,
      limit: query.limit || 10,
      where: query.filter ? sqs.find(query.filter) : {},
      order: query.sort ? sqs.sort(query.sort) : []
    };
    return model.findAndCountAll(qObj);
  },

  patch: (model) => ({id, patch}) => {
    return new Promise((resolve, reject) => {
      if (id === undefined) {
        return reject('`id` not specified in payload to patch()');
      }
      if (patch === undefined) {
        return reject('`patch` not specified in payload to patch()');
      }
      model.findById(id).then((instance) => {
        if (instance === undefined) {
          return reject(`no ${model.name} with id ${id} could be found to patch`);
        }
        instance.update(patch)
          .then(resolve)
          .catch(reject);
      });
    });
  },

  delete: (model) => ({ids}={}) => {
    // NOTE: sequelize takes care of cascade-deleting any relations
    let query;
    if (ids === undefined) {
      // destroy(undefined) destroys all
      query = { truncate: true }; 
    } else {
      if (!Array.isArray(ids)) {
        throw new Error('.delete() expects { ids: [ ... ] }');
      }
      // build a query object the likes of which sequelize expects
      query = {
        where: {
          [Op.or]: ids.map((id) => ({"id": id}))
        }
      };
    }
    return new Promise((resolve, reject) => {
      model.destroy(query)
        // we must return an object
        .then((deleted) => resolve({deleted}))
        .catch(reject);
    });
          
  }

};

/*
 * creates the rest path for a model,g iven its prefix and an optional suffix
 */
const modelRestPath = (prefix, model, suffix) => () => (
  `${prefix}/${model.name}s` + (suffix ? `${suffix}` : '')
);

/*
 * a map keyed by [method]["instance" | "model"] returning functions that can
 * be passed (prefix, model, suffix?) to generate the path the instance/model
 * should be served on
 */
const resourceFuncs = {

  post: {
    instance: modelRestPath,
    model: modelRestPath
  },

  get: {
    instance: modelRestPath,
    model: modelRestPath
  },

  patch: {
    instance: (prefix, model) => function () { 
      return modelRestPath(prefix, model, `/${this.id}`)();
    },
    model: (prefix, model) => modelRestPath(prefix, model, '/:id')
  },

  delete: {
    instance: (prefix, model) => function () { 
      return modelRestPath(prefix, model, `?ids=${this.id}`)();
    },
    model: modelRestPath
  }
}

/*
 * a map keyed by [method] returning functions taking a model and returning
 * a request-handling function in the express style (req, res, next)
 */
const routerFuncs = {

  post: (model) => (req, res, next) => {
    respond(req, res, next, model.restify().post(req.body));
  },

  get: (model) => (req, res, next) => {
    respond(req, res, next, model.restify().get(req.query));
  },

  patch: (model) => (req, res, next) => {
    respond(req, res, next, model.restify().patch({
      id: req.params.id, 
      patch: req.body
    }));
  },

  delete: (model) => (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
      respond(req, res, next, model.restify().delete()); 
    } else {
      // attempt to parse the query as a comma-separated list of ID's
      if (/^[0-9]+(,[0-9]+)*$/.test(req.query.ids)) {
        const ids = req.query.ids.split(',');
        respond(req, res, next, model.restify().delete({ids}));
      } else {
        respondError(req, res, new Error(`query "${req.query.ids}" did not match /^[0-9]+(,[0-9]+)*$/`));
      }
    }
  },

};

/** @class Restifier
 * @description Used to "restify" a sequelize model. Adds methods like `get()` 
 *  and `post()` to the model, along with `restify()`, which returns an object
 *  with various properties (most important is `.paths`, a dictionary of
 *  functions keyed by http method (eg. `.get()`) returning descriptions express 
 *  can consume for each http method key (eg. `"${prefix}/todo/:id"`).
 *
 *  Instances of the model also get a `.restify()` method with `paths` which,
 *  for the instance, return the specific path the instance resides at (eg. 
 *  `"${prefix}/todo/1"`).
 */
class Restifier {

  constructor (prefix) {
    this.prefix = prefix;
  }

  // modify the model so that it has rest method funcs
  restify (methods, model) {

    const restifyObj = {
      supportedMethods: [],
      expressRoutes: {},
      paths: {}
    };

    const instanceMethods = {
      paths: {}
    };

    // add restify() to model
    for (var method of methods) {
      if (!(method in methodFuncs)) {
        throw new Error(`methodFunc ${method} is not implemented in restify`);
      }
      restifyObj[method] = methodFuncs[method](model);
      restifyObj.supportedMethods.push(method);
      restifyObj.paths[method] = resourceFuncs[method].model(this.prefix, model);
      // collect instance methods to attach to the instances in the constructor
      instanceMethods.paths[method] = resourceFuncs[method].instance(this.prefix, model);
    }
    model.restify = () => restifyObj;

    // add restify() to instances
    model.prototype.restify = function () {
      const restifyObj = {
        paths: {}
      };
      for (var method of Object.keys(instanceMethods.paths)) {
        const pathMethod = instanceMethods.paths[method];
        restifyObj.paths[method] = pathMethod.bind(this);
      }
      return restifyObj;
    }

    return model;

  }

  /*
   * creates an express router given a list of restified sequelize models
   */
  createAPIRouter (models) {
    const router = express.Router();
    router.use(bodyParser.json());
    for (var model of models) {
      for (var method of model.restify().supportedMethods) {
        if (!(method in routerFuncs)) {
          throw new Error(`routerFunc ${method.ToUpperCase()} is not implemented in restify`);
        }
        const path = model.restify().paths[method]();
        const handler = routerFuncs[method](model);
        router[method](path, handler);
      }
    }
    return router;
  }
  
}

module.exports = {
  // enables the pattern: restify = require('restify').prefix('/api')
  prefix: (prefix) => new Restifier(prefix)
};

