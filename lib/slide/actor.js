function Actor() {
  var self = this;
  Slide.crypto.generateKeys(function(keys) {
    keys = Slide.crypto.packKeys(keys);
    self.publicKey = keys.publicKey;
    self.privateKey = keys.privateKey;
    self.initialize();
  });
}

Actor.prototype.initialize = function() {
  $.post(Slide.endpoint("/actors"),
    JSON.stringify({key: this.publicKey}),
    function(resp) {
      console.log(resp);
    });
};

Actor.prototype.listen = function(cb) {
  var socket = new WebSocket(Slide.endpoint("/actors/" + this.id + "/listen"));
  var self = this;
  console.log("listening");
  socket.onmessage = function (event) {
    var data = JSON.parse(event.data).fields;
    cb(Slide.crypto.AES.decryptData(data, self.aes));
  };
};

export default Actor;

