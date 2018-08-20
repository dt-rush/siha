'use strict';

/** @module restify */

const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sqs = require('sequelize-querystring');

const { withDB } = require('./db');
const { respond, respondError } = require('./express-utils');

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
      model.findById(id).then((instance) => {
        instance.update(patch)
          .then(resolve)
          .catch(reject);
      });
    });
  },

  delete: (model) => ({ids}={}) => {
    // NOTE: sequelize takes care of cleaning up any relations
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

const modelRestPath = (prefix, model, suffix) => () => (
  `${prefix}/${model.name}s` + (suffix ? `${suffix}` : '')
);

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

