
'use strict';

const http = require('http');
const Config = require('./config/config');

const server = http.createServer((request, response) => {
  const params = {
    method: request.method,
    headers: request.headers,
    requestUrl: request.url,
    request,
    response
  };

  const Bifrost = require('./lib/bifrost');
  Bifrost.proxy(params, (err) => {
    if (err) throw err;
  });
});

const port = Config.port;
server.listen(port);
console.log("Bifrost listening on port: " + port);
