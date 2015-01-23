var assert = require('assert');
exports = module.exports = function (Slide) {
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
};

