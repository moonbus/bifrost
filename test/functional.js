
'use strict';

const should = require('should');
const Cache = require('../lib/cache');
const Routes = require('../lib/routes');
const Bifrost = require('../lib/bifrost');

describe('Bifrost Functional Tests', () => {
  describe('Cache', () => {
    const cacheParams = {
      key: 'test',
      data: '12345',
      ttl: 60,
      tags: ['ABC']
    };

    it ('should write items to cache', (done) => {
      Cache.set(cacheParams, (err, result) => {
        should.not.exist(err);
        result.key.should.be.equal('test');
        result.data.should.be.equal('12345');
        done();
      });
    });

    it ('should get cached item', (done) => {
      Cache.get({key: 'test'}, (err, result) => {
        should.not.exist(err);
        result.key.should.be.equal('test');
        result.data.should.be.equal('12345');
        done();
      });
    });
  });

  describe('Routes', () => {
    let dictonary;
    it ('Should get dictonary of routes', (done) => {
      Routes.get((err, result) => {
        should.not.exist(err);
        result['/foo|GET'].route.should.be.equal('/foo');
        result['/foo|GET'].path.should.be.equal('sample.url.com');
        result['/foo|GET'].method.should.be.equal('GET');
        result['/foo|GET'].prepend.should.be.equal('/test');
        result.cacheHit.should.be.equal(false);
        done();
      });
    });

    it ('Should get dictonary of routes from cache', (done) => {
      Routes.get((err, result) => {
        should.not.exist(err);
        result['/foo|GET'].route.should.be.equal('/foo');
        result['/foo|GET'].path.should.be.equal('sample.url.com');
        result['/foo|GET'].method.should.be.equal('GET');
        result['/foo|GET'].prepend.should.be.equal('/test');
        result.cacheHit.should.be.equal(true);
        dictonary = result;
        done();
      });
    });

    it ('Should get dictonary as a Promise', (done) => {
      Routes.get().then((result) => {
        result['/foo|GET'].route.should.be.equal('/foo');
        result['/foo|GET'].path.should.be.equal('sample.url.com');
        result['/foo|GET'].method.should.be.equal('GET');
        result['/foo|GET'].prepend.should.be.equal('/test');
        done();
      });
    });

    it ('should find stuff', (done) => {
      const request = {
        dictonary,
        url: '/foo/bar/monkey',
        requestUrl: '/foo/bar/monkey',
        method: 'GET'
      }
      Routes.find(request, (err, result) => {
        done();
      });
    });
  });

});
