import API from './api';
import Crypto from './crypto';

var Conversation = function(upstream, downstream, cb) {
  this.symmetricKey = Crypto.AES.generateKey();
  this.key = Crypto.encrypt(this.symmetricKey, downstream.key);
  this.upstream_type = upstream.type;
  this.downstream_type = downstream.type;
  var device = downstream.type === 'user' ? 'downstream_number' : 'downstream_id';
  var upDevice = upstream.type === 'user' ? 'upstream_number' : 'upstream_id';
  this[device] = downstream.downstream;
  this[upDevice] = upstream.upstream;
  this.initialize(function(conversation) {
    cb(conversation);
  });
};

Conversation.fromObject = function(obj, cb) {
  $.extend(this, obj);
  this.initialize(cb);
};

Conversation.prototype.initialize = function(cb) {
  var downstream_pack = this.downstream_type.toLowerCase() === 'user' ? {
    type: this.downstream_type.toLowerCase(), number: this.downstream_number
  } : {
    type: this.downstream_type.toLowerCase(), id: this.downstream_id
  };
  var upstream_pack = this.upstream_type.toLowerCase() === 'user' ? {
    type: this.upstream_type.toLowerCase(), number: this.upstream_number
  } : {
    type: this.upstream_type.toLowerCase(), id: this.upstream_id
  };
  var payload = {
    key: Crypto.AES.prettyKey(this.key),
    upstream: upstream_pack,
    downstream: downstream_pack
  };

  var self = this;
  API.post('/conversations', {
    data: payload,
    success: function (conversation) {
      self.id = conversation.id;
      cb(self);
    } });
}

Conversation.prototype.request = function(blocks, cb) {
  API.post('/conversations/' + this.id + '/request_content', {
    data: { blocks: blocks },
    success: cb
  });
};

Conversation.prototype.deposit = function (fields) {
  API.post('/conversations/' + this.id + '/deposit_content', {
    data: { fields: Crypto.AES.encryptData(fields, this.symmetricKey) }
  });
};

Conversation.prototype.respond = function(fields) {
  API.put('/conversations/' + this.id, {
    data: { fields: Crypto.AES.encryptData(fields, this.symmetricKey) }
  });
};

Conversation.prototype.submit = function(uuid, fields) {
  var enc = Crypto.AES.encryptData(fields, this.symmetricKey);
  var payload = {};
  payload[uuid] = enc;
  API.put('/conversations/' + this.id, {
    data: { fields: payload, patch: payload }
  });
};

export default Conversation;
