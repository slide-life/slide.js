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

  describe('.loadRelationship()', function () {
    var otherActor1, otherActor2;

    before(function (done) {
      Slide.Actor.create({
        success: function (a) {
          otherActor1 = a;
          Slide.Actor.create({
            success: function (b) {
              otherActor2 = b;
              done();
            }
          });
        }
      });
    });

    it('should create a new relationship where none exists', function (done) {
      actor.loadRelationship(otherActor1, {
        success: function (relationship) {
          assert(relationship);
          assert(relationship.id);
          done();
        }
      });
    });

    it('should load an existing relationship', function (done) {
      actor.createRelationship(otherActor2, {
        success: function (relationship) {
          actor.loadRelationship(otherActor2, {
            success: function (loaded) {
              assert.equal(relationship.id, loaded.id);
              done();
            }
          });
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

  describe('.patch()', function () {
    it('should patch the profile and retrieve it', function (done) {
      actor.patch({
        private: {
          'a': [ {
            'a.b': {
              'c.d': 'e.f'
            }
          } ]
        }
      }, {
        success: function (actor) {
          assert.equal(actor.profile.private['a'][0]['a.b']['c.d'], 'e.f');
          done();
        }
      });
    });
  });
});
