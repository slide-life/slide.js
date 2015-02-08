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
      var FIRST_NAME = 'Test first name';
      var LAST_NAME  = 'Test last name';
      user.patch({ private: { name: { first: [FIRST_NAME] } } }, {
        success: function (user) {
          user.patch({ private: { name: { last: [LAST_NAME] } } }, {
            success: function (user) {
              assert.equal(user.profile.private.name.first[0], FIRST_NAME);
              assert.equal(user.profile.private.name.last[0], LAST_NAME);
              done();
            }
          });
        }
      });
    });
  });

  describe('.addDevice()', function () {
    it('should add a device to a user', function (done) {
      user.addDevice('ios', 'Test registration id', {
        success: function (user) {
          done();
        }
      })
    });
  })
});
