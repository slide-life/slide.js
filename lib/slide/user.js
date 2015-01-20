var User = function(number, pub, priv, key) {
  this.number = number;
  this.publicKey = pub;
  this.privateKey = priv;
  this.symmetricKey = key;
};

User.prompt = function(cb) {
  var user = new this();
  var form = $("<form><input type='text'><input type='submit' value='Send'></form>");
  $('#modal .modal-body').append(form);
  form.submit(function(evt) {
    evt.preventDefault();
    var number = $(this).find('[type=text]').val();
    $.get(Slide.endpoint('/users/' + number + '/public_key'), function(resp) {
      var key = resp.public_key;
      user.number = number;
      user.symmetricKey = key;
      cb.call(user, number, key);
    });
  });
  $("#modal").modal('toggle');
  return user;
};

User.fromObject = function(obj) {
  return new this(obj.number, obj.publicKey, obj.privateKey, obj.symmetricKey);
};

User.prototype.persist = function() {
  var obj = {
    number: this.number,
    publicKey: this.publicKey,
    privateKey: this.privateKey,
    symmetricKey: this.symmetricKey
  };
  window.localStorage.user = JSON.stringify(obj);
};

User.load = function(fail, success) {
  if( window.localStorage.user ) {
    success(this.fromObject(JSON.parse(window.localStorage.user)));
  } else {
    fail(success);
  }
};

User.register = function(number, cb) {
  var keys;
  var user = new User();
  Slide.crypto.generateKeys(function(k) {
    keys = Slide.crypto.packKeys(k);
  });
  var symmetricKey = Slide.crypto.AES.generateKey();
  var key = Slide.crypto.encryptStringWithPackedKey(symmetricKey, keys.publicKey);
  user.symmetricKey = symmetricKey;
  user.publicKey = keys.publicKey;
  user.privateKey = keys.privateKey;
  user.number = number;
  $.post(Slide.endpoint("/users"),
    JSON.stringify({ key: key, public_key: keys.publicKey, user: number }),
    function(u) {
      user.id = u.id;
      cb && cb(user);
    });
};

User.prototype.listen = function(cb) {
  var socket = new WebSocket(Slide.endpoint('ws://', '/users/' + this.number + '/listen'));
  var self = this;
  socket.onmessage = function (event) {
    var message = JSON.parse(event.data);
    if( message.verb == "verb_request" ) {
      cb(message.payload.blocks, message.payload.conversation);
    } else {
      var data = message.payload.fields;
      cb(Slide.crypto.AES.decryptData(data, self.symmetricKey));
    }
  };
};

User.prototype.requestPrivateKey = function(cb) {
  var actor = new Slide.Actor();
  var self = this;
  actor.openRequest(['private-key'], this.number, this.symmetricKey, function(fields) {
    cb.call(self, fields['private-key']);
  });
};

export default User;

