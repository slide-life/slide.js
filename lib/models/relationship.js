var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Conversation = require('./conversation');

function Relationship () { }

Relationship.get = function (id, cbs) {
  API.get('/relationships/' + id, cbs);
}

Relationship.prototype.getConversations = function (cbs) {
  API.get('/relationships/' + this.id, {
    success: function (relationship) {
      cbs.success(relationship.conversations);
    },
    failure: cbs.failure
  });
};

Relationship.prototype.createConversation = function (name, cbs) {
  API.post('/relationships/' + this.id + '/conversations', {
    data: {
      name: name
    },
    success: function (conv) {
      var conversation = new Conversation();
      conversation.id = conv.id;
      conversation.name = conv.name;
      conversation.relationship = conv.relationship_id;
      cbs.success(conversation);
    },
    failure: cbs.failure
  });
};

exports = module.exports = Relationship;
