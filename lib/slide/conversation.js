var Conversation = function(upstream, downstream, cb) {
  var key = Slide.crypto.AES.generateKey();
  var obj = {
    symmetricKey: key,
    key: Slide.crypto.encryptStringWithPackedKey(key, downstream.key),
    upstream_id: upstream,
    upstream_type: 'actor',
    downstream_type: downstream.type
  };
  var device = downstream.type == 'actor' ? 'downstream_id' : 'downstream_number';
  obj[device] = downstream.downstream;
  Conversation.FromObject.call(this, obj, cb.bind(this));
};

Conversation.FromObject = function(obj, cb) {
  this.symmetricKey = obj.symmetricKey;
  var self = this;
  var downstream_pack = obj.downstream_type.toLowerCase() == "actor" ? {
    type: obj.downstream_type.toLowerCase(), id: obj.downstream_id
  } : {
    // TODO: need number
    type: obj.downstream_type.toLowerCase(), number: obj.downstream_number
  };
  var upstream_pack = obj.upstream_type.toLowerCase() == "actor" ? {
    type: obj.upstream_type.toLowerCase(), id: obj.upstream_id
  } : {
    type: obj.upstream_type.toLowerCase(), number: obj.upstream_number
  };
  var payload = {
    key: obj.key,
    upstream: upstream_pack,
    downstream: downstream_pack
  };
  $.post(Slide.endpoint("/conversations"),
    JSON.stringify(payload),
    function(conversation) {
      self.id = conversation.id;
      cb(self);
    });
};
Conversation.FromObject.prototype = Conversation.prototype;

Conversation.prototype.request = function(blocks, cb) {
  $.post(Slide.endpoint("/conversations/" + this.id + "/request_content"),
    JSON.stringify({blocks: blocks}),
    function(conversation) {
      cb && cb();
    });
};

Conversation.prototype.deposit = function(fields) {
  $.post(Slide.endpoint("/conversations/" + this.id + "/deposit_content"),
    JSON.stringify({fields: Slide.crypto.AES.encryptData(fields, this.symmetricKey)}),
    function(conversation) {
      // Handle response?
    });
};

$.put = function(url, payload, cb) {
  $.ajax({ url: url, type: 'PUT', data: payload, success: cb });
};
Conversation.prototype.respond = function(fields) {
  $.put(Slide.endpoint("/conversations/" + this.id + ""),
    JSON.stringify({fields: Slide.crypto.AES.encryptData(fields, this.symmetricKey)}),
    function(conversation) {
      // Handle response?
    });
};

export default Conversation;
