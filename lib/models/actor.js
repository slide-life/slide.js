var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Relationship = require('./relationship');

function Actor () { }

Actor.create = function (cbs) {
  var rsa = Crypto.RSA.packKeys(Crypto.RSA.generateKeysSync());;
  var keys = {
    private: rsa.private,
    public: rsa.public,
    symmetric: Crypto.AES.generateKey()
  };

  API.post('/actors', {
    data: {
      key: keys.public
    },
    success: function (data) {
      var actor  = new Actor();
      actor.id   = data.id;
      actor.keys = keys;

      cbs.success(actor);
    },
    failure: cbs.failure
  });
};

Actor.get = function (id, cbs) {
  API.get('/actors/' + id, cbs);
};

Actor.prototype.createRelationship = function (user, cbs) {
  var self = this;
  var key = Crypto.AES.generateKey();
  API.post('/relationships', {
    data: {
      current_user_temp: this.id, // TODO: use API authentication
      user: user.id,
      key: Crypto.RSA.encryptSymmetricKey(key, user.keys.public)
    },
    success: function (rel) {
      var relationship   = new Relationship();
      relationship.id    = rel.id;
      relationship.left  = self;
      relationship.right = user;
      relationship.key   = key;
      cbs.success(relationship);
    },
    failure: cbs.failure
  });
};

exports = module.exports = Actor;
