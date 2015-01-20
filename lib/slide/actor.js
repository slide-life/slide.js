function Actor(name) {
  var self = this;
  if( name ) this.name = name;
  Slide.crypto.generateKeys(function(keys) {
    keys = Slide.crypto.packKeys(keys);
    self.publicKey = keys.publicKey;
    self.privateKey = keys.privateKey;
  });
}

Actor.fromObject = function(obj) {
  var actor = new Actor();
  actor.privateKey = obj.privateKey;
  actor.publicKey = obj.publicKey;
  actor.name = obj.name;
  actor.id = obj.id;
  return actor;
};

Actor.prototype.openRequest = function(blocks, downstream, onMessage) {
  this.openConversation(downstream, function(conversation) {
    conversation.request(blocks);
  }, onMessage);
};

Actor.prototype.initialize = function(cb) {
  $.post(Slide.endpoint("/actors"),
    JSON.stringify({key: this.publicKey}), cb.bind(this));
};

Actor.prototype.openConversation = function(downstream, onCreate, onMessage) {
  var self = this;
  this.initialize(function(actor) {
    self.id = actor.id;
    self.listen(function(fields) {
      $('#modal').modal('toggle');
      onMessage(fields);
    });

    var conversation = new Slide.Conversation(self.id, downstream, onCreate);
    self.key = conversation.symmetricKey;
  });
};

Actor.prototype.listen = function(cb) {
  var socket = new WebSocket(Slide.endpoint('ws://', '/actors/' + this.id + '/listen'));
  var self = this;
  socket.onmessage = function (event) {
    var message = JSON.parse(event.data);
    if( message.verb == "verb_request" ) {
      cb(message.payload.blocks, message.payload.conversation);
    } else {
      var data = message.payload.fields;
      console.log("dec", self.key);
      cb(Slide.crypto.AES.decryptData(data, self.key));
    }
  };
};

export default Actor;
