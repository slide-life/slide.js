var assert = require('assert');
var Slide = require('../../lib/slide');

var http = require('http');
var url = require('url');
var ngrok = require('ngrok');

var NGROK_AUTH_TOKEN = 'UiKi8KAZGrUOstdifNx7';
var NGROK_TUNNEL = 'slide-testing-56f2d61a';
var NGROK_RECEIVER_PORT = 9293;
var SMS_TEST_NUMBER = 18575762052;

describe('User', function () {
  var user;

  before(function (done) {
    ngrok.connect({
      authtoken: NGROK_AUTH_TOKEN,
      subdomain: NGROK_TUNNEL,
      port: NGROK_RECEIVER_PORT
    }, function () {
      Slide.User.create({ value: SMS_TEST_NUMBER, type: 'phone' }, 'test_password_123', {
        success: function (u) {
          user = u;
          done();
        }
      });
    });
  });


  describe('.verifyIdentifier()', function () {
    it('should verify the identifier that the user has signed up wih', function (done) {
      var server = http.createServer(function (request, response) {
        var data = url.parse(request.url, true).query;
        var pin = data.Body.split('Your slide verification code is ')[1].split('. It will expire in 5 minutes.')[0];

        assert.equal(pin.length, 6);
        // TODO: verify number

        response.writeHead(200);
        response.end();

        server.close();
        done();
      }).listen(NGROK_RECEIVER_PORT);
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
  });

  after(function () {
    ngrok.disconnect();
  });
});
