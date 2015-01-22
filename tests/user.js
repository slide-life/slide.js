var User = require('../js/slide/user');

describe('User', function () {
  describe('#register()', function () {
    it('should register a user', function (done) {
      var randomNumber = Math.random() * Math.pow(10,17);
      User.register(randomNumber, function (u) {
        assert.equal(user.number, randomNumber);
        done();
      });
    });
  });
});
