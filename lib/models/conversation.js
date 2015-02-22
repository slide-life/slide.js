var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Message = require('./message');

function Conversation () { }

Conversation.fromObject = function (obj) {
  var conversation = new Conversation();
  conversation.id = obj.id;
  conversation.name = obj.name;
  conversation.relationshipId = obj.relationship_id;
  return conversation;
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

Conversation.get = function (id) {
  // TODO
};

Conversation.prototype.getMessages = function(types, cbs) {
  // Maybe TODO
  var self = this;
  API.get('/relationships/'+ this.relationshipId +'/conversations/' + this.id + '/messages',
    { success: function(ms) {
       cbs.success(ms.filter(function(m) {
         return types.indexOf(m.message_type) != -1;
       }).map(Message.fromObject).map(function (m) {
         m.conversation = self;
         return m;
       }));
     },
     failure: cbs.failure });
};

Conversation.prototype.request = function (to, blocks, cbs) {
  API.post('/relationships/' + this.relationshipId + '/conversations/' + this.id + '/requests', {
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
      API.post('/relationships/' + relationship.id + '/conversations/' + self.id + '/requests/' + request.id, {
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
      API.post('/relationships/' + relationship.id + '/conversations/' + self.id + '/deposits', {
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
