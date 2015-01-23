exports = module.exports = function (Slide) {
  describe('User', function () {
    describe('#register()', function () {
      it('should register a user', function (done) {
        var randomNumber = Math.random() * Math.pow(10, 18);
        Slide.User.register(randomNumber, function (u) {
          assert.equal(u.number, randomNumber);
          done();
        });
      });
    });
  });
};
