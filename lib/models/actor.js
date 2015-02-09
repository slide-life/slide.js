var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Listener = require('./listener');
var Relationship = require('./relationship');

function Actor () {
  this.profile = this._generateProfile();
  this.keys    = this._generateKeys();
}

/* Static methods */

Actor.create = function (cbs) {
  var actor  = new Actor();
  API.post('/actors', {
    data: {
      key: actor.keys.public
    },
    success: function (data) {
      actor.id = data.id;
      cbs.success(actor);
    },
    failure: cbs.failure
  });
};

Actor.get = function (id, cbs) {
  API.get('/actors/' + id, cbs);
};

/* Polymorphic methods */

Actor.prototype._generateProfile = function () {
  return {
    private: {},
    public: {}
  };
};

Actor.prototype._generateKeys = function () {
  var rsa = Crypto.RSA.packKeys(Crypto.RSA.generateKeysSync());
  return {
    private: rsa.private,
    public: rsa.public,
    symmetric: Crypto.AES.generateKey()
  };
};

Actor.prototype.createRelationship = function (actor, cbs) {
  var self = this;
  var key = Crypto.AES.generateKey();
  API.post('/relationships', {
    data: {
      current_user_temp: this.id, // TODO: use API authentication
      actor: actor.id,
      key: Crypto.RSA.encryptSymmetricKey(key, actor.keys.public)
    },
    success: function (rel) {
      var relationship   = new Relationship();
      relationship.id    = rel.id;
      relationship.left  = self;
      relationship.right = actor;
      relationship.key   = key;
      cbs.success(relationship);
    },
    failure: cbs.failure
  });
};

Actor.prototype.patch = function (profile, cbs) {
  var self = this;
  API.patch('/actors/' + this.id, {
    data: {
      profile: profile
    },
    success: function (actor) {
      self.profile = actor.profile;
      cbs.success(self);
    },
    failure: cbs.failure
  });
};

Actor.prototype.listen = function (onmessage) {
  var socket = API.socket('/actors/' + this.id + '/listen');
  socket.onmessage = function (event) {
    onmessage(JSON.parse(event.data));
  };
};

Actor.prototype.addListener = function (listener, cbs) {
  API.post('/actors/' + this.id + '/listeners', {
    data: listener,
    success: cbs.success,
    failure: cbs.failure
  });
};

Actor.prototype.addWebhook = function (scope, url, method, cbs) {
  this.addListener(Listener.buildWebhook(scope, url, method), cbs);
};

exports = module.exports = Actor;
