var assert = require('assert');
var Slide = require('../../lib/slide');

function requestAndRespond (individual, organisation, relationship, data, cbs) {
  relationship.createConversation('Test conversation', {
    success: function (conversation) {
      conversation.request(individual, ['bank.card'], {
        success: function (request) {
          conversation.respond(request, data, cbs);
        }
      });
    }
  });
}

describe('Relationship', function () {
  var individual, organisation, relationship;

  before(function (done) {
    Slide.Actor.create({
      success: function (ind) {
        Slide.Actor.create({
          success: function (org) {
            individual   = ind;
            organisation = org;
            done();
          }
        });
      }
    });
  });

  describe('.createRelationship()', function () {
    it('should create a relationship between two actors', function (done) {
      organisation.createRelationship(individual, {
        success: function (rel) {
          relationship = rel;
          done();
        }
      });
    });
  });

  describe('.createConversation()', function () {
    it('should create a conversation on a relationship', function (done) {
      requestAndRespond(individual, organisation, relationship, { 'bank.card': 'Test' }, {
        success: function () {
          done();
        }
      });
    });

    it('should fail to create a conversation on a relationship', function (done) {
      requestAndRespond(individual, organisation, relationship, { 'bank': 'Test' }, {
        failure: function () {
          done();
        }
      });
    });
  });

  describe('.getConversations()', function () {
    it('should return a list of conversations on a relationship', function (done) {
      relationship.getConversations({
        success: function (conversations) {
          assert.equal(conversations.length, 2);
          done();
        }
      });
    });
  });
});
