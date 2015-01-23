var assert = require('assert');
exports = module.exports = function (Slide) {
  describe('User', function () {
    describe('#register()', function () {
      it('should register a user', function (done) {
        Slide.User.register("Number", function (u) {
          assert.equal(u.number, "Number");
          done();
        });
      });
    });
  });
};
