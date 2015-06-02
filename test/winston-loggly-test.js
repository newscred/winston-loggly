/*
 * loggly-test.js: Tests for instances of the Loggly transport
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    winston = require('winston'),
    sinon = require('sinon'),
    helpers = require('winston/test/helpers'),
    Loggly = require('../lib/winston-loggly').Loggly;

var tokenTransport,
    metaTransport,
    config;

var testMetadata = { meta: 'data' };

try {
  config = require('./config');
}
catch (ex) {
  console.log('Error reading test/config.json.')
  console.log('Are you sure it exists?\n');
  console.dir(ex);
  process.exit(1);
}

tokenTransport = new (Loggly)({
  subdomain: config.transports.loggly.subdomain,
  token: config.transports.loggly.token
});

metaTransport = new (Loggly)({
  subdomain: config.transports.loggly.subdomain,
  token: config.transports.loggly.token,
  addMeta: testMetadata 
});


function assertLoggly(transport) {
  assert.instanceOf(transport, Loggly);
  assert.isFunction(transport.log);
}

vows.describe('winston-loggly').addBatch({
  "An instance of the Loggly Transport": {
    "when passed an input token": {
      "should have the proper methods defined": function () {
        assertLoggly(tokenTransport);
      },
      "the log() method": helpers.testNpmLevels(tokenTransport, "should log messages to loggly", function (ign, err, logged) {
        assert.isNull(err);
        assert.isTrue(logged);
      })
    }
  },
}).addBatch({
  "with addMeta": {
    "should log the additional metadata": function () {
      sinon.spy(winston, 'log');
      metaTransport.log('info', 'Test', {}, function () {
        assert.deepEqual(winston.log.getCall(0).args[0].meta, testMetadata);
        sinon.log.restore();
      });
    }
  }
}).export(module);
