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
    var anotherActor, relationship;

    before(function (done) {
      Slide.Actor.create({
        success: function (a) {
          anotherActor = a;
          anotherActor.createRelationship(actor, {
            success: function (r) {
              relationship = r;
              done();
            }
          });
        }
      });
    });

    it('should listen for events', function (done) {
      relationship.createConversation('Test conversation', {
        success: function (conversation) {
          actor.listen(function (message, socket) {
            socket.close();
            assert.equal(message.blocks[0], 'bank.card');
            done();
          });

          conversation.request(actor, ['bank.card'], {
            success: function () {}
          });
        }
      });
    });

    it('should listen for responses', function (done) {
      var data = { 'bank.card': 'Test' };
      relationship.createConversation('Test conversation', {
        success: function (conversation) {
          anotherActor.listen(function (message, socket) {
            socket.close();
            assert.equal(message.data['bank.card'], 'Test');
            done();
          });

          conversation.request(actor, ['bank.card'], {
            success: function (request) {
              conversation.respond(request, data, {
                success: function () {
                }
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
