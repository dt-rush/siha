'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { withDB } = require('./db');
const { respond, respondError } = require('./express-utils');

// modify the model so that we can do, (for example, if Todo is a Model)
// Todo.rest().create({'name': 'make the bed'});
const restify = exports.restify = (model) => {

  model.rest = function() {

    return {

      post: (instance) => {
        return new Promise((resolve, reject) => {
          withDB(() => {
            this.create(instance)
              .then(resolve)
              .catch(reject);
          });
        });     
      },

      patch: (id, patchObj) => {
        return new Promise((resolve, reject) => {
          this.findById(id).then((instance) => {
            instance.update(patchObj)
              .then(resolve)
              .catch(reject);
          });
        });
      },

      get: (query) => {
        if (Object.keys(query).length === 0) {
          return model.findAll();
        } else {
          console.error(`query parsing not implemented yet`);
          // TODO
        }
      },

      delete: (ids) => {
        let query;
        if (ids === undefined) {
          // destroy(undefined) destroys all
          query = undefined; 
        } else {
          // build a query object the likes of which sequelize expects
          query = {
            where: {
              [Op.or]: ids.map((id) => ({"id": id}))
            }
          };
        }
        return new Promise((resolve, reject) => {
          this.destroy(query)
            .then((deleted) => {
              // TODO: check for foreign keys which might reference this and annull them
              resolve({deleted});
            })
            .catch(reject);
        });
      }

    };

  };

  return model;

};

exports.createREST = (model) => {

  const router = express.Router();
  router.use(bodyParser.json());

  router.post(`/${model.name}s`, (req, res, next) => {
    respond(req, res, next, model.rest().post(req.body));
  });

  router.patch(`/${model.name}/:id`, (req, res, next) => {
    respond(req, res, next, model.rest().patch(req.params.id, req.body));
  });

  router.get(`/${model.name}s`, (req, res, next) => {
    respond(req, res, next, model.rest().get(req.query));
  });

  router.delete(`/${model.name}s`, (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
      respond(req, res, next, model.rest().delete()); 
    } else {
      // attempt to parse the query as a comma-separated list of ID's
      if (/^[0-9]+(,[0-9]+)*$/.test(req.query.ids)) {
        const ids = req.query.ids.split(',');
        respond(req, res, next, model.rest().delete(ids));
      } else {
        respondError(req, res, new Error(`query "${req.query.ids}" did not match /^[0-9]+(,[0-9]+)*$/`));
      }
    }
  });

  return router;
};

