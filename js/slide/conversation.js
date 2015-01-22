import API from './api';
import Crypto from './crypto';

var Conversation = function(upstream, downstream, cb, sym) {
  var key = sym || Crypto.AES.generateKey();
  var obj = {
    symmetricKey: key,
    key: Crypto.encryptStringWithPackedKey(key, downstream.key),
    upstream_type: upstream.type,
    downstream_type: downstream.type
  };
  var device = downstream.type === 'user' ? 'downstream_number' : 'downstream_id';
  var upDevice = upstream.type === 'user' ? 'upstream_number' : 'upstream_id';
  obj[device] = downstream.downstream;
  obj[upDevice] = upstream.upstream;
  Conversation.FromObject.call(this, obj, cb.bind(this));
};

Conversation.FromObject = function(obj, cb) {
  this.symmetricKey = obj.symmetricKey;
  var self = this;
  var downstream_pack = obj.downstream_type.toLowerCase() === 'user' ? {
    type: obj.downstream_type.toLowerCase(), number: obj.downstream_number
  } : {
    type: obj.downstream_type.toLowerCase(), id: obj.downstream_id
  };
  var upstream_pack = obj.upstream_type.toLowerCase() === 'user' ? {
    type: obj.upstream_type.toLowerCase(), number: obj.upstream_number
  } : {
    type: obj.upstream_type.toLowerCase(), id: obj.upstream_id
  };

  var payload = {
    key: obj.key,
    upstream: upstream_pack,
    downstream: downstream_pack
  };

  API.post('/conversations', {
    data: payload,
    success: function (conversation) {
      self.id = conversation.id;
      cb(self);
    }
  });
};

Conversation.FromObject.prototype = Conversation.prototype;

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
