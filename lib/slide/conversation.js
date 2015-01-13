var Conversation = function(key, upstream, downstream) {
  this.key = key;
  this.upstream = upstream;
  this.downstream = downstream;
  $.post(Slide.endpoint("/conversations"),
    JSON.stringify({key: key, upstream: upstream, downstream: downstream}),
    function(conversation) {
      console.log(conversation);
    });
};

export default Conversation;

