var assert = require('assert');
var Slide = require('../../lib/slide');

describe('Actor', function () {
  var actor;

  before(function (done) {
    Slide.Actor.create({
      success: function (a) {
        actor = a;
        done();
      }
    });
  });

  describe('#get()', function () {
    it('should get an actor by id', function (done) {
      Slide.Actor.get(actor.id, {
        success: function (a) {
          assert.equal(actor.keys.public, a.key);
          done();
        }
      });
    });
  });

  describe('.listen()', function () {
    var anotherActor;

    before(function (done) {
      Slide.Actor.create({
        success: function (a) {
          anotherActor = a;
          done();
        }
      });
    });

    it('should listen for events', function (done) {
      anotherActor.createRelationship(actor, { //anotherActor as organization
        success: function (relationship) {
          relationship.createConversation('Test conversation', {
            success: function (conversation) {
              actor.listen(function (event) {
                assert.equal(event.relationship.id, relationship.id);
                assert.equal(event.conversation.id, conversation.id);
                assert.equal(event.message.message_type, 'request');
                assert.equal(event.message.blocks[0], 'bank.card');
                done();
              });

              conversation.request(actor, ['bank.card'], {
                success: function () {}
              });
            }
          });
        }
      });
    });
  });

  describe('.addListener()', function () {
    it('should add a listener', function (done) {
      actor.addWebhook({}, 'http://google.com', 'post', {
        success: function () {
          done();
        }
      });
    });
  });
});
