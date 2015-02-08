var assert = require('assert');
var Slide = require('../../lib/slide');

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
      relationship.createConversation('Test conversation', {
        success: function (conversation) {
          done();
        }
      });
    });
  });
});
