var Conversation = function(key, upstream, downstream) {
  this.key = key;
  this.upstream = upstream;
  this.downstream = downstream;
  var self = this;
  $.post(Slide.endpoint("/conversations"),
    JSON.stringify({key: key, upstream: upstream, downstream: downstream}),
    function(conversation) {
      console.log(conversation);
      self.id = conversation.id;
      self.request(['first-name']);
    });
};

Conversation.prototype.request = function(blocks) {
  $.post(Slide.endpoint("/conversations/" + this.id + "/request_content"),
    JSON.stringify({blocks: blocks}),
    function(conversation) {
      console.log("requested", blocks);
    });
};

export default Conversation;

