function Channel (blocks) {
  this.blocks = blocks;
  return this;
}

Channel.fromObject = function (object) {
  var channel = new Channel();
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      channel[key] = object[key];
    }
  }
  channel.privateKey = forge.pki.privateKeyFromPem(channel.privateKey);
  return channel;
};

Channel.prototype.toObject = function () {
  var channel = this;
  var object = {};
  for (var key in channel) {
    if (channel.hasOwnProperty(key)) {
      object[key] = channel[key];
    }
  }
  object.privateKey = forge.pki.privateKeyToPem(object.privateKey);
  return object;
};

Channel.prototype.prompt = function(cb) {
  var form = $("<form><input type='text'><input type='submit' value='Send'></form>");
  $('#modal .modal-body').append(form);
  form.submit(function(evt) {
    evt.preventDefault();
    var number = $(this).find("[type=text]").val();
    $.get("http://" + Slide.host + "/users/" + number + "/public_key", function(resp) {
      var key = resp.public_key;
      cb(number, key);
    });
  });
  $("#modal").modal('toggle');
};

Channel.prototype.create = function (number, key, cb) {
  var self = this;
  self.aes = Slide.crypto.AES.generateKey();
  var encryptedKey = Slide.crypto.encryptStringWithPackedKey(self.aes, key)
  $.ajax({
    type: 'POST',
    url: 'http://' + Slide.host + '/channels',
    contentType: 'application/json',
    data: JSON.stringify({
      key: encryptedKey,
      blocks: self.blocks,
      number: number
    }),
    success: function (data) {
      self.id = data.id;
      self.listen(function (fields) {
        $('#modal').modal('toggle');
        cb && cb(fields);
      });
    }
  });
}

Channel.prototype.getWSURL = function () {
  return 'ws://' + Slide.host + '/channels/' + this.id + '/listen';
};

Channel.prototype.getURL = function () {
  return 'http://' + Slide.host + '/channels/' + this.id;
};

Channel.prototype.getQRCodeURL = function () {
  return this.getURL() + '/qr';
};

Channel.prototype.listen = function (cb) {
  var socket = new WebSocket(this.getWSURL());
  var self = this;
  socket.onmessage = function (event) {
    var data = JSON.parse(event.data).fields;
    cb(Slide.crypto.AES.decryptData(data, self.aes));
  };
};

Channel.prototype.getResponses = function(cb) {
  var privateKey = this.privateKey;
  $.ajax({
    type: 'GET',
    url: 'http://' + Slide.host + '/channels/' + this.id,
    contentType: 'application/json',
    success: function (data) {
      cb(data.responses.map(function(response) {
        response.fields = Slide.crypto.decryptData(response.fields, privateKey);
        return response;
      }));
    }
  });
};

export default Channel;
