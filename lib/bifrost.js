
'use strict';

const async = require('async');
const http = require('http');

const BifrostController = function () {};

const doRequest = (params, callback) => {
  const Routes = require('./routes');

  return async.waterfall([
    (callback) => {
      return Routes.get(callback);
    },
    (dictonary, callback) => {
      params.dictonary = dictonary;
      Routes.find(params, (err, result) => {
        return callback(err, result);
      });
    },
    (paths, callback) => {
      if (paths.result === "") {

      }

      if (paths.parsedUrl[1] !== undefined) {
        paths.requestUrl = paths.reuqestUrl + "?" + paths.parsedUrl[1];
      }
      const proxyRequest = http.request({
        host: paths.result.path,
        port: 80,
        path: paths.requestUrl,
        method: params.method,
        headers: params.headers
      }, (proxyResponse) => {
        paths.response.writeHead(proxyResponse.statusCode, proxyResponse.header);
        proxyResponse.pipe(paths.response);
        return callback(null, paths);
      });


      paths.request.pipe(proxyRequest);
    }
  ], (err, result) => {
    return callback(err, result);
  });
};

BifrostController.prototype.proxy = (params, callback) => {
  params.parsedUrl = params.request.url.split('?');
  params.url = params.parsedUrl[0];
  params.reuqestUrl = params.parsedUrl[0];

  return doRequest(params, callback);
};

module.exports = new BifrostController();
