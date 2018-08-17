'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

  get: (model) => (query) => {
    if (query === undefined || Object.keys(query).length === 0) {
      return model.findAll();
    } else {
      console.error(`query parsing not implemented yet`);
      // TODO
    }
  },

  patch: (model) => (id, patchObj) => {
    return new Promise((resolve, reject) => {
      model.findById(id).then((instance) => {
        instance.update(patchObj)
          .then(resolve)
          .catch(reject);
      });
    });
  },

  delete: (model) => (ids) => {
    let query;
    if (ids === undefined) {
      // destroy(undefined) destroys all
      query = { truncate: true }; 
    } else {
      // build a query object the likes of which sequelize expects
      query = {
        where: {
          [Op.or]: ids.map((id) => ({"id": id}))
        }
      };
    }
    return new Promise((resolve, reject) => {
      model.destroy(query)
        .then((deleted) => {
          // TODO: check for foreign keys which might reference this and annull them
          resolve({deleted});
        })
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
    respond(req, res, next, model.restify().patch(req.params.id, req.body));
  },

  delete: (model) => (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
      respond(req, res, next, model.restify().delete()); 
    } else {
      // attempt to parse the query as a comma-separated list of ID's
      if (/^[0-9]+(,[0-9]+)*$/.test(req.query.ids)) {
        const ids = req.query.ids.split(',');
        respond(req, res, next, model.restify().delete(ids));
      } else {
        respondError(req, res, new Error(`query "${req.query.ids}" did not match /^[0-9]+(,[0-9]+)*$/`));
      }
    }
  },

};

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

