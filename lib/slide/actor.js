function Actor() {
  var self = this;
  Slide.crypto.generateKeys(function(keys) {
    self.publicKey = keys.publicKey;
    self.privateKey = keys.privateKey;
    self.key = Slide.crypto.AES.generateKey();
    self.initialize("16144408217");
  });
}

Actor.prototype.initialize = function(downstream) {
  var self = this;
  self.getDownstreamKey(downstream, function(downstreamKey) {
    var key = Slide.crypto.encryptStringWithPackedKey(self.key, downstreamKey);
    $.post(Slide.endpoint("/actors"),
      JSON.stringify({key: self.publicKey}),
      function(actor) {
        self.id = actor.id;
        self.listen(function(data) {
          console.log(data);
        });

        var conversation = new Slide.Conversation(key, self.id, downstream);
      });
  });
};

Actor.prototype.getDownstreamKey = function(downstream, cb) {
  // NB: assuming it's a user
  $.get(Slide.endpoint("/users/" + downstream + "/public_key"), function(resp) {
    var key = resp.public_key;
    cb(key);
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

