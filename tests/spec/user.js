require('../monkey-patches');
var assert = require('assert');
var Slide = require('../../build/slide').default;

describe('User', function () {

  describe('#register()', function () {
    it('should register a user', function (done) {
      var number = "" + Math.floor(Math.random() * 1e7);
      Slide.User.register(number, function (u) {
        assert.equal(u.number, number);
        done();
      });
    });
  });

});

