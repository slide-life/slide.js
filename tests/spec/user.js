var assert = require('assert');
var Slide = require('../../lib/slide');

describe('User', function () {
  var user;

  before(function (done) {
    Slide.User.create({ value: Math.floor(Math.random() * 1e7), type: 'phone' }, 'test_password_123', {
      success: function (u) {
        user = u;
        done();
      }
    });
  });

  // describe('#get()', function () {
  //   it('should get a user by id', function (done) {
  //     Slide.User.get(user.id, {
  //       success: function (u) {
  //         assert.equal(user.id, u.id);
  //         done();
  //       }
  //     });
  //   });
  // });

  describe('.patch()', function () {
    it("should patch a user's profile", function (done) {
      user.patch({ private: { name: { first: ['Test first name'] } } }, {
        success: function (user) {
          done();
        }
      });
    });
  });
});
