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
});
