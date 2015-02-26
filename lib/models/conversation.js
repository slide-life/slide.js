var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Message = require('./message');

function Conversation () { }

Conversation.fromObject = function (obj) {
  var conversation = new Conversation();
  conversation.id = obj.id;
  conversation.name = obj.name;
  conversation.relationshipId = obj.relationshipId;
  return conversation;
};

Conversation.get = function (relationshipId, id, cbs) {
  API.get('/relationships/' + relationshipId + '/conversations/' + id, {
    success: function (c) {
      var conversation = Conversation.fromObject(c);
      cbs.success(conversation);
    },
    failure: cbs.failure
  });
};

Conversation.prototype._endpoint = function (str) {
  return '/relationships/' + this.relationshipId + '/conversations/' + this.id + str;
};

Conversation.prototype.getRelationship = function (cbs) {
  var self = this;
  var Relationship = require('./relationship');

  if (this.relationship) {
    cbs.success(this.relationship);
  } else {
    API.get('/relationships/' + this.relationshipId, {
      success: function (relationship) {
        self.relationship = Relationship.fromObject(relationship);
        cbs.success(self.relationship);
      },
      failure: cbs.failure
    })
  }
};

Conversation.prototype.getMessages = function(types, cbs) {
  // Maybe TODO
  var self = this;
  API.get(this._endpoint('/messages'),
    { success: function(ms) {
       cbs.success(ms.filter(function(m) {
         return types.indexOf(m.messageType) != -1;
       }).map(Message.fromObject).map(function (m) {
         m.conversation = self;
         return m;
       }));
     },
     failure: cbs.failure });
};

Conversation.prototype.request = function (to, blocks, cbs) {
  API.post(this._endpoint('/requests'), {
    data: {
      to: to.id, // TODO: will become redundant after authentication
      blocks: blocks
    },
    success: function (m) {
      var request    = new Message.Request();
      request.id     = m.id;
      request.to     = to;
      request.blocks = blocks;
      cbs.success(request);
    },
    failure: cbs.failure
  });
};

Conversation.prototype.respond = function (request, data, cbs) {
  var self = this;

  this.getRelationship({
    success: function (relationship) {
      API.post(self._endpoint('/requests/' + request.id), {
        data: {
          data: relationship.encryptData(data)
        },
        success: function (m) {
          var response     = new Message.Response();
          response.id      = m.id;
          response.request = request.id;
          response.data    = data;
          cbs.success(response);
        },
        failure: cbs.failure
      });
    },
    failure: cbs.failure
  });
};

Conversation.prototype.deposit = function (to, data, cbs) {
  var self = this;

  this.getRelationship({
    success: function (relationship) {
      API.post(self._endpoint('/deposits'), {
        data: {
          to: to.id, // TODO: will become redundant after authentication
          data: relationship.encryptData(data)
        },
        success: function (m) {
          var deposit  = new Message.Deposit();
          deposit.id   = m.id;
          deposit.to   = to;
          deposit.data = data;
          cbs.success(deposit);
        },
        failure: cbs.failure
      });
    },
    failure: cbs.failure
  });
};

exports = module.exports = Conversation;
