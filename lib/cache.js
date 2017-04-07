
'use strict';

const stow = require('stow');
const MemoryBackend = require('stow/backends/memory');
let cacheStore;

const CacheController = function () {
  cacheStore = stow.createCache(MemoryBackend, {ttl: 300});
};

CacheController.prototype.get = (params, callback) => {
  cacheStore.get(params.key, (err, data) => {
    return callback(err, data);
  });
};

CacheController.prototype.set = (params, callback) => {
  cacheStore.set({
    key: params.key,
    data: params.data,
    ttl: params.ttl || 60,
    tags: params.tags
  }, (err) => {
    if (err) {
      throw err;
    }
    const result = {
      key: params.key,
      data: params.data
    };
    return callback(err, result);
  });
};

module.exports = new CacheController();
