var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Listener = require('./listener');
var Relationship = require('./relationship');
var Message = require('./message');

function Actor () {
  this.profile = this._generateProfile();
  this.keys    = this._generateKeys();

  this.relationships = {};
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

Actor.prototype.encryptKey = function (key) {
  return Crypto.RSA.encryptSymmetricKey(key, this.keys.public);
};

Actor.prototype.decryptKey = function (key) {
  return Crypto.RSA.decryptSymmetricKey(key, this.keys.private);
};

Actor.prototype.createRelationship = function (actor, cbs) {
  var self = this;
  var key = Crypto.AES.generateKey();
  var encryptedKey = actor.encryptKey(key);
  API.post('/relationships', {
    data: {
      current_user_temp: this.id, // TODO: use API authentication
      actor: actor.id,
      key: encryptedKey
    },
    success: function (rel) {
      var relationship   = Relationship.fromObject(rel);
      relationship.left  = self;
      relationship.right = actor;
      relationship.key   = key;

      self.relationships[relationship.id] = relationship;
      cbs.success(relationship);
    },
    failure: cbs.failure
  });
};

Actor.prototype.getRelationship = function (relationshipId, cbs) {
  var self = this;

  if (this.relationships[relationshipId]) {
    cbs.success(this.relationships[relationshipId]);
  } else {
    Relationship.get(relationshipId, {
      success: function (relationship) {
        if (!relationship.key) {
          if (self.id === relationship.leftId) {
            relationship.key = self.decryptKey(relationship.leftKey);
          } else if (self.id === relationship.rightId) {
            relationship.key = self.decryptKey(relationship.rightKey);
          }
        }
        cbs.success(relationship);
      },
      failure: cbs.failure
    });
  }
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
  var self = this;

  var socket = API.socket('/actors/' + this.id + '/listen');
  socket.onmessage = function (event) {
    var parsedEvent           = JSON.parse(event.data);
    var relationshipId        = parsedEvent.relationship.id;
    self.getRelationship(relationshipId, {
      success: function (relationship) {
        var encryptedMessage  = Message.fromObject(parsedEvent.message);
        var decryptedMessage  = relationship.decryptMessage(encryptedMessage);
        onmessage(decryptedMessage, socket);
      }
    });
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
