var Conversation = function(key, upstream, downstream, cb) {
  this.key = key;
  this.upstream = upstream;
  this.downstream = downstream;
  var self = this;
  $.post(Slide.endpoint("/conversations"),
    JSON.stringify({key: key, upstream: upstream, downstream: downstream}),
    function(conversation) {
      self.id = conversation.id;
      cb(self);
    });
};

Conversation.prototype.request = function(blocks) {
  $.post(Slide.endpoint("/conversations/" + this.id + "/request_content"),
    JSON.stringify({blocks: blocks}),
    function(conversation) {
      // Handle response?
    });
};

export default Conversation;

