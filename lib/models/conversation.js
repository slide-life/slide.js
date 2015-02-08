var API = require('../utils/api');
var Crypto = require('../utils/crypto');

function Conversation () { }

Conversation.prototype.sendMessage = function (to, request, type) {
  API.post('/relationships/' + this.relationship + '/conversations/' + this.id, {
    data: {
      name: name
    },
    success: function (conv) {
      var conversation = new Conversation();
      conversation.id = conv.id;
      conversation.name = conv.name;
      cbs.success(conversation);
    },
    failure: cbs.failure
  });
};

exports = module.exports = Conversation;
