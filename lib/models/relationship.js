var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Conversation = require('./conversation');
var Message = require('./message');

function Relationship () { }
Relationship.fromObject = function (obj) {
  var relationship = new Relationship();
  relationship.id = obj.id;
  relationship.leftId = obj.leftId;
  relationship.rightId = obj.rightId;
  relationship.leftKey = obj.leftKey;
  relationship.rightKey = obj.rightKey;
  relationship.conversations = (obj.conversations || []).map(Conversation.fromObject);
  return relationship;
};

Relationship.get = function (id, cbs) {
  API.get('/relationships/' + id, {
    success: function (relationship) {
      cbs.success(Relationship.fromObject(relationship));
    },
    failure: cbs.failure
  });
};

Relationship.inlineReferences = function (relationship, conversations, requests, cb) {
  // NB: Avoids circular reference.
  var Actor = require('./actor');
  var gotRight = function (left, right) {
    relationship.left = left;
    relationship.right = right;
    cb(relationship);
  };
  var gotLeft = function (left) {
    var right = gotRight.bind({}, left);
    Actor.get(relationship.rightId, {
      success: right,
      failure: right
    });
  };
  requests = requests.filter(function (r) {
    return !r.read;
  });
  relationship.conversations = conversations;
  relationship.requests = requests;
  Actor.get(relationship.leftId, {
    success: gotLeft,
    failure: gotLeft
  });
};

Relationship.prototype._endpoint = function (str) {
  return '/relationships/' + this.id + str;
};

Relationship.prototype.getConversations = function (cbs) {
  var self = this;
  API.get(this._endpoint('/conversations'), {
    success: function (conversations) {
      cbs.success(conversations.map(Conversation.fromObject).map(function (c) {
        c.relationship = self;
        c.relationshipId = self.id;
        return c;
      }));
    },
    failure: cbs.failure
  });
};

Relationship.prototype.encryptData = function (data) {
  return Crypto.AES.encryptData(data, this.key);
};

Relationship.prototype.decryptData = function (data) {
  return Crypto.AES.decryptData(data, this.key);
};

Relationship.prototype.encryptMessage = function (message) { //only for deposit or response
  var encryptedMessage;
  if (message.type === 'deposit') {
    encryptedMessage = new Message.Deposit();
  } else if (message.type === 'response') {
    encryptedMessage = new Message.Response();
  }

  encryptedMessage.data = this.encryptData(message.data);
  return encryptedMessage;
};

Relationship.prototype.decryptMessage = function (message) {
  var decryptedMessage;
  if (message instanceof Message.Deposit) {
    decryptedMessage = new Message.Deposit();
    decryptedMessage.data = this.decryptData(message.data);
  } else if (message instanceof Message.Response) {
    decryptedMessage = new Message.Response();
    decryptedMessage.data = this.decryptData(message.data);
  } else if (message instanceof Message.Request) {
    decryptedMessage = message;
  }

  return decryptedMessage;
};

Relationship.prototype.createConversation = function (name, cbs) {
  var self = this;

  API.post(this._endpoint('/conversations'), {
    data: {
      name: name
    },
    success: function (conv) {
      var conversation = Conversation.fromObject(conv);
      conversation.relationship = self;
      conversation.relationshipId = self.id;
      cbs.success(conversation);
    },
    failure: cbs.failure
  });
};


exports = module.exports = Relationship;

