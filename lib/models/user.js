var API = require('../utils/api');
var Crypto = require('../utils/crypto');

function User () { }

User.create = function (identifier /* { identifier, type } */, password, cbs) {
  var rsa = Crypto.RSA.packKeys(Crypto.RSA.generateKeysSync());;
  var keys = {
    private: rsa.private,
    public: rsa.public,
    symmetric: Crypto.AES.generateKey()
  };

  API.post('/users', {
    data: {
      identifier: identifier,
      password: password,
      key: keys.public
    },
    success: function (data) {
      var user        = new User();
      user.id         = data.id;
      user.keys       = keys;
      user.identifier = identifier;

      cbs.success(user);
    },
    failure: cbs.failure
  });
};

User.get = function (id, cbs) {
  API.get('/users/' + id, cbs);
};

exports = module.exports = User;
