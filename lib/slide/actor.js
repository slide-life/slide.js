function Actor() {
  var self = this;
  Slide.crypto.generateKeys(function(keys) {
    self.publicKey = keys.publicKey;
    self.privateKey = keys.privateKey;
    self.key = Slide.crypto.AES.generateKey();
  });
}

Actor.prototype.openConversation = function(downstream, downstreamKey, listen, cb) {
  var self = this;
  var key = Slide.crypto.encryptStringWithPackedKey(self.key, downstreamKey);
  $.post(Slide.endpoint("/actors"),
    JSON.stringify({key: self.publicKey}),
    function(actor) {
      self.id = actor.id;
      self.listen(function(fields) {
        // UI shit
        $('#modal').modal('toggle');
        listen(fields);
      });

      var conversation = new Slide.Conversation(key, self.id, downstream, cb);
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

