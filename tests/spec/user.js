var assert = require('assert');
var Slide = require('../../lib/slide');

var http = require('http');
var url = require('url');
var ngrok = require('ngrok');

var NGROK_AUTH_TOKEN = 'UiKi8KAZGrUOstdifNx7';
var NGROK_TUNNEL = 'slide-testing-56f2d61a';
var NGROK_RECEIVER_PORT = 9293;
var SMS_TEST_NUMBER = 18575762052;
var SMS_WRONG_TEST_NUMBER = 19195909909;

describe('User', function () {
  var user, organisation;

  var testVerification = (function() {
    var done = false, success, _cb;

    // Start a server which twilio will use as a post-message hook
    var verifyServer = http.createServer(function (request, response) {
      var data = url.parse(request.url, true).query;
      pin = data.Body.match(/(\S+)\./)[1];

      response.writeHead(200);
      response.end();
      verifyServer.close();

      done = true;
      _cb && _cb(pin);
    }).listen(NGROK_RECEIVER_PORT);

    // Wrap response validation to prevent race conditions
    var testVerification = function (cb) {
      if (done) {
        cb(pin);
      } else {
        _cb = cb;
      }
    };

    return testVerification;
  }());

  before(function (done) {
    ngrok.connect({
      authtoken: NGROK_AUTH_TOKEN,
      subdomain: NGROK_TUNNEL,
      port: NGROK_RECEIVER_PORT
    }, function () {
      Slide.User.create(new Slide.Identifier.Phone(SMS_TEST_NUMBER), 'test_password_123', {
        success: function (u) {
          user = u;
          Slide.Actor.create({
            success: function (org) {
              organisation = org;
              done();
            }
          });
        }
      });
    });
  });


  describe('.verifyIdentifier()', function () {
    it.skip('should verify the identifier that the user has signed up wih', function (done) {
      this.timeout(5e3);
      testVerification(function(pin) {
        user.verifyIdentifier(user.identifiers[0], pin, {
          success: done
        });
      });
    });

    it('should not verify an incorrectly defined verification code', function (done) {
      user.addIdentifier(new Slide.Identifier.Phone(SMS_WRONG_TEST_NUMBER), {
        success: function (identifier) {
          user.verifyIdentifier(identifier, '0000000', {
            failure: function (body) {
              user.verifyIdentifier(identifier, '0000000', {
                failure: function (body) {
                  user.verifyIdentifier(identifier, '0000000', {
                    failure: function (body) {
                      user.verifyIdentifier(identifier, '0000000', {
                        failure: function (body) {
                          assert.notEqual(body.error.length, 0);
                          done();
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
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

  describe('.getRelationships()', function () {
    it('should get relationships', function (done) {
      organisation.createRelationship(user, {
        success: function (rel) {
          var createdId = rel.id;
          user.getRelationships({
            success: function(relationships) {
              assert.equal(relationships.filter(function(rel) {
                return rel.id == createdId;
              }).length, 1);
              // TODO: check for equivalence of more than just id between
              // created and fetched relationships.
              done();
            },
            failure: function() {
              console.log('failed');
            }
          })
        }
      });
    });
  });

  after(function () {
    ngrok.disconnect();
  });
});
