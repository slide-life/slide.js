require('../mocks');
var assert = require('assert');
var Slide = require('../../build/slide').default;

describe('Actor', function () {

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

  describe('.initialize()', function () {
    this.timeout(5e3);
    it('initializes new actor successfully', function (done) {
      var local = new Slide.Actor("Actor");
      local.register(function(actor) {
        assert.equal(actor.public_key, local.publicKey);
        done();
      });
    });
  });

  describe('.openRequest()', function () {
    this.timeout(5e3);
    it('should request data', function (done) {
      var requestedBlocks = ['slide.life:bank.card'];
      converse(requestedBlocks, function(blocks) {
        assert.equal(blocks[0], requestedBlocks[0]);
        done();
      });
    });
  });

  describe('.processMessage()', function () {
    it('should process a request', function (done) {
      var requestedBlocks = ['slide.life:bank.card.number'];
      var profile = {'slide/life:bank/card/number': '1234'};
      var conversation;
      converse(requestedBlocks, function(blocks) {
        conversation.respond(profile);
      }, function(fields) {
        var cleanedKeys = requestedBlocks.map(function(key) {
          return key.replace(/\./g, '/');
        });
        assert.equal(fields[cleanedKeys[0]], profile[cleanedKeys[0]]);
        done();
      }, function(conv) {
        conversation = conv;
      });
    });

    it.skip('should process a deposit', function (done) {
    });
  });

  describe('.openConversation()', function () {
    it.skip('should open a conversation', function (done) {
    });
  });
});

