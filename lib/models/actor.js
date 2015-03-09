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

Actor.properties = ['profile', 'keys', 'relationships', 'id'];

var mapKeys = function (f, profile) {
  if (profile instanceof Array) {
    return profile.map(function (ele) {
      return mapKeys(f, ele);
    });
  } else if (profile instanceof Object) {
    var ret = {};
    for (key in profile) {
      ret[f(key)] = mapKeys(f, profile[key]);
    }
    return ret;
  } else {
    return profile;
  }
};

Actor._convertProfileFromClient = function (profile) {
  return mapKeys(function (key) {
    return key.replace(/\./g, '/');
  }, profile);
};

Actor._convertProfileFromServer = function (profile) {
  return mapKeys(function (key) {
    return key.replace(/\//g, '.');
  }, profile);
};

Actor.fromObject = function (obj) {
  var actor = new this();
  this.properties.forEach(function(prop) {
    actor[prop] = obj[prop];
  });
  actor.profile.private = Actor._convertProfileFromServer(actor.profile.private);
  actor.profile.public = Actor._convertProfileFromServer(actor.profile.public);
  actor.keys = actor.keys || { public: obj.key };
  return actor;
};

Actor.toObject = function (actor) {
  var obj = {};
  this.properties.forEach(function(prop) {
    obj[prop] = actor[prop];
  });
  obj.profile.private = Actor._convertProfileFromClient(actor.profile.private);
  obj.profile.public = Actor._convertProfileFromClient(actor.profile.public);
  return obj;
};

Actor.prototype.toObject = function() {
  return this.constructor.toObject(this);
};

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

Actor._clientFormatProfile = function (profile) {
  return {
    private: Actor._convertProfileFromServer(profile.private),
    public: Actor._convertProfileFromServer(profile.public)
  };
};

Actor._serverFormatProfile = function (profile) {
  return ({
    public: Actor._convertProfileFromClient(profile.public),
    private: Actor._convertProfileFromClient(profile.private)
  });
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

Actor.prototype._classIdentifier = function () {
  return 'actors';
};

Actor.prototype._endpoint = function (str) {
  return '/' + this._classIdentifier() + '/' + this.id + (str || '');
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
  var otherKey = actor.encryptKey(key);
  var myKey = this.encryptKey(key);
  API.post('/relationships', {
    data: {
      currentUserTemp: this.id, // TODO: use API authentication
      currentUserKey: myKey,
      actor: actor.id,
      actorKey: otherKey
    },
    success: function (rel) {
      var relationship   = Relationship.fromObject(rel);
      relationship.left  = self;
      relationship.right = actor;
      relationship.key   = key;

      self.relationships = self.relationships || {};
      self.relationships[relationship.id] = relationship;
      cbs.success(relationship);
    },
    failure: cbs.failure
  });
};

Actor.prototype.loadRelationship = function (actor, cbs) {
  var self = this;

  API.get(this._endpoint('/relationships/with/' + actor.id), {
    success: function (relWithExists) {
      if (relWithExists.exists) {
        var rel = relWithExists.relationship;
        var relationship = self._renderRelationship(rel);
        cbs.success(relationship);
      } else {
        self.createRelationship(actor, cbs);
      }
    },
    failure: cbs.failure
  });
};

Actor.prototype._renderRelationship = function (relationship) {
  var self = this;
  if (!relationship.key) {
    if (self.id === relationship.leftId) {
      relationship.key = self.decryptKey(relationship.leftKey);
    } else if (self.id === relationship.rightId) {
      relationship.key = self.decryptKey(relationship.rightKey);
    }
  }
  return Relationship.fromObject(relationship);
};

Actor.prototype.getRelationships = function (cbs) {
  var self = this;
  API.get(this._endpoint('/relationships'), {
    success: function(relationships) {
      cbs.success(relationships.map(self._renderRelationship.bind(self)).map(function(r) {
        // TODO: check correctness of decryption without the following block
        // r.actor = self;
        // r.key = r.actor.decryptKey(r.rightKey);
        return r;
      }));
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
        cbs.success(self._renderRelationship(relationship));
      },
      failure: cbs.failure
    });
  }
};

Actor.prototype.patch = function (profile, cbs) {
  var self = this;
  API.patch(this._endpoint(), {
    data: {
      profile: Actor._serverFormatProfile(profile)
    },
    success: function (actor) {
      self.profile = Actor._clientFormatProfile(actor.profile);
      cbs.success(self);
    },
    failure: cbs.failure
  });
};

Actor.prototype.listen = function (onmessage) {
  var self = this;

  var socket = API.socket(this._endpoint('/listen'));
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
  API.post(this._endpoint('/listeners'), {
    data: listener,
    success: cbs.success,
    failure: cbs.failure
  });
};

Actor.prototype.addWebhook = function (scope, url, method, cbs) {
  this.addListener(Listener.buildWebhook(scope, url, method), cbs);
};

exports = module.exports = Actor;
