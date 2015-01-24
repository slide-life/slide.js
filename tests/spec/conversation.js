require('../monkey-patches');
var assert = require('assert');
var Slide = require('../../build/slide').default;

describe('Conversation', function () {
  function converse(blocks, reply, onMessage, onCreate) {
    new Slide.Actor().initialize(function(downstream) {
      downstream._listen(WebSocket, reply);
      new Slide.Actor().initialize(function(upstream) {
        upstream.openRequest(blocks, {
          downstream: downstream.id, type: 'actor', key: downstream.publicKey
        }, onMessage, onCreate);
      });
    });
  }

  describe('#fromObject()', function () {
    it.skip('should initialize a Conversation from an object', function () {
    });
  });

  describe('.register()', function () {
    it.skip('should register a conversation with the backend', function (done) {
    });
  });

  describe('.request()', function () {
    it('should request data', function (done) {
      var requestedBlocks = ['slide.life:bank.card.number'];
      converse(requestedBlocks, function(blocks) {
        assert.equal(blocks[0], requestedBlocks[0]);
        done();
      });
    });
  });

  describe('.deposit()', function () {
    it.skip('should deposit data', function (done) {
    });
  });

  describe('.respond()', function () {
    it.skip('should respond to a deposit', function (done) {
    });
  });

  describe('.submit()', function () {
    it.skip('should put encrypted data', function (done) {
    });
  });
});

