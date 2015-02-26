var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Actor = require('./actor');
var Identifier = require('./identifier');

function User (identifier) {
  Actor.call(this);
  this.identifiers = [identifier];
}

User.prototype = Object.create(Actor.prototype);
User.prototype._classIdentifier = function () {
  return 'users';
};

User.properties = Actor.properties.concat(['identifiers']);
User.fromObject = Actor.fromObject;
User.toObject = Actor.toObject;

User.create = function (identifier /* { identifier, type } */, password, cbs) {
  var user  = new User(identifier);
  API.post('/users', {
    data: {
      identifier: identifier,
      password: password,
      key: user.keys.public
    },
    success: function (data) {
      user.id          = data.id;
      user.identifiers = data.identifiers.map(Identifier.fromObject);
      cbs.success(user);
    },
    failure: cbs.failure
  });
};

User.getByIdentifier = function (identifier, cbs) {
  API.get('/users', {
    data: {
      identifier: identifier.value,
      identifierType: identifier.type
    },
    success: function (u) {
      var user = User.fromObject(u);
      cbs.success(user);
    },
    failure: cbs.failure
  });
};

User.prototype.addDevice = function (type, id, cbs) {
  API.post(this._endpoint('/devices'), {
    data: {
      device: {
        id: id,
        type: type
      }
    },
    success: cbs.success,
    failure: cbs.failure
  });
};

User.prototype.addIdentifier = function (identifier, cbs) {
  var self = this;

  API.post(this._endpoint('/identifiers'), {
    data: identifier.toObject(),
    success: function (i) {
      var identifier = Identifier.fromObject(i);
      self.identifiers.push(identifier);
      cbs.success(identifier);
    },
    failure: cbs.failure
  });
};

User.prototype.verifyIdentifier = function (identifier, verificationCode, cbs) {
  API.post(this._endpoint(identifier._endpoint('/verify')), {
    data: {
      verificationCode: verificationCode
    },
    success: cbs.success,
    failure: cbs.failure
  });
};

exports = module.exports = User;
