var Conversation = function(upstream, downstream, downstreamKey, cb) {
  this.symmetricKey = Slide.crypto.AES.generateKey();
  var key = Slide.crypto.encryptStringWithPackedKey(this.symmetricKey, downstreamKey);
  this.key = key;
  this.upstream = upstream;
  this.downstream = downstream;
  var self = this;
  $.post(Slide.endpoint("/conversations"),
    JSON.stringify({key: key, upstream: { type: 'actor', id: upstream }, downstream: { type: 'user', number: downstream }}),
    function(conversation) {
      self.id = conversation.id;
      cb(self);
    });
};

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

export default Conversation;
