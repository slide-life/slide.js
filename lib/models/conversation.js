var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Message = require('./message');

function Conversation () { }

Conversation.prototype.sendRequest = function (to, blocks, cbs) {
  API.post('/relationships/' + this.relationship + '/conversations/' + this.id + '/requests', {
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

Conversation.prototype.sendResponse = function (request, data, cbs) {
  API.post('/relationships/' + this.relationship + '/conversations/' + this.id + '/requests/' + request.id, {
    data: {
      data: data
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
};

Conversation.prototype.sendDeposit = function (to, data, cbs) {
  API.post('/relationships/' + this.relationship + '/conversations/' + this.id + '/deposits', {
    data: {
      to: to.id, // TODO: will become redundant after authentication
      data: data
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
};

exports = module.exports = Conversation;
