function Actor() {
  var self = this;
  Slide.crypto.generateKeys(function(keys) {
    self.publicKey = keys.publicKey;
    self.privateKey = keys.privateKey;
  });
}

Actor.prototype.openRequest = function(blocks, downstream, downstreamKey, cb) {
  this.openConversation(downstream, downstreamKey, function(conversation) {
    conversation.request(blocks);
  }, cb);
};

Actor.prototype.openConversation = function(downstream, downstreamKey, onCreate, onMessage) {
  var self = this;
  $.post(Slide.endpoint("/actors"),
    JSON.stringify({key: self.publicKey}),
    function(actor) {
      self.id = actor.id;
      self.listen(function(fields) {
        // UI shit
        $('#modal').modal('toggle');
        onMessage(fields);
      });

      var conversation = new Slide.Conversation(self.id, downstream, downstreamKey, onCreate);
      self.key = conversation.symmetricKey;
    });
};

Actor.prototype.listen = function(cb) {
  var socket = new WebSocket(Slide.endpoint("ws://", "/actors/" + this.id + "/listen"));
  var self = this;
  socket.onmessage = function (event) {
    var data = JSON.parse(event.data).fields;
    cb(Slide.crypto.AES.decryptData(data, self.key));
  };
};

export default Actor;

