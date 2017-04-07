
'use strict';

const fs = require('fs');
const Cache = require('./cache');
const Path = require('path');
const Promise = require('bluebird');
const Config = require('../config/config');
const cacheKey = 'routes';

const isMongoId = (params) => {
  try {
    return ObjectId(params.urlPart).toString() === params.urlPart
  } catch (err) {
    return false;
  }
};

const RoutesController = function () {};

const getConfig = (params, callback) => {
  const configFile = fs.readFile(params.routes, (err, data) => {
    if (err) throw err;
    return callback(null, JSON.parse(data));
  });
};

/**
 * Creates a dictonary of routes based on config file found in /config
 *
 * @function callback
 */
RoutesController.prototype.get = (callback) => {
  return new Promise((resolve, reject) => {
    Cache.get({key: 'routes'}, (err, result) => {
      if (err) throw err;
      if (result === null) {
        let dictonary = {};
        getConfig(Config, (err, config) => {
          config.forEach((route) => {
            if (route.method === '*') {
              if (!dictonary[route.route + '|' + 'GET']) {
                dictonary[route.route + '|' + 'GET'] = route;
              }
              if (!dictonary[route.route + '|' + 'DELETE']) {
                dictonary[route.route + '|' + 'DELETE'] = route;
              }
              if (!dictonary[route.route + '|' + 'POST']) {
                dictonary[route.route + '|' + 'POST'] = route;
              }
              if (!dictonary[route.route + '|' + 'PUT']) {
                dictonary[route.route + '|' + 'PUT'] = route;
              }
            } else {
              dictonary[route.route + '|' + route.method] = route;
            }
          });

          const cacheParams = {
            key: cacheKey,
            data: dictonary,
            ttl: 60,
            tags: []
          };
          Cache.set(cacheParams, (err, result) => {
            if (err) throw err;
            dictonary['cacheHit'] = false;
            return resolve(dictonary);
          });
        });
      } else {
        result.data['cacheHit'] = true;
        return resolve(result.data);
      }
    });
  }).asCallback(callback);

};

RoutesController.prototype.find = (params, callback) => {
  let url = '';
  let response;
  const parsedUrl = params.url.split('/');
  const self = this;
  /* Convert MongoIDs to {mongoid} for dynamic matching */
  parsedUrl.forEach((urlPart) => {
    if (urlPart) {
      if (isMongoId({urlPart: urlPart})) {
        url = url + '/{mongoid}';
      } else {
        url = url + '/' + urlPart;
      }
    }
  });

  /* Now find match in dictonary */
  if (params.dictonary[url + '|' + params.method] !== undefined) {
    params.result = params.dictonary[url + '|' + params.method];

    if (params.result.prepend) {
      params.requestUrl = params.result.prepend + params.requestUrl;
    }

    return callback(null, params);
  } else {
    let processUrl = () => {
      url = Path.dirname(url);
      if (url === '/') {
        return callback(null, params);
      }

      if (params.dictonary[url + '|' + params.method] !== undefined) {
        params.result = params.dictonary[url + '|' + params.method];

        if (params.result.prepend) {
          params.requestUrl = params.results.prepend + params.requestUrl;
        }

        return callback(null, params);
      }
      setTimeout(processUrl, 0);
    };
    processUrl();
  }

}



module.exports = new RoutesController();
