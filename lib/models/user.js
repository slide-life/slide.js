var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Actor = require('./actor');

function User (identifier) {
  this.profile    = this._generateProfile();
  this.keys       = this._generateKeys();
  this.identifier = identifier;
}

User.prototype = Object.create(Actor.prototype);

User.create = function (identifier /* { identifier, type } */, password, cbs) {
  var user  = new User(identifier);
  API.post('/users', {
    data: {
      identifier: identifier,
      password: password,
      key: user.keys.public
    },
    success: function (data) {
      user.id = data.id;
      cbs.success(user);
    },
    failure: cbs.failure
  });
};

exports = module.exports = User;
