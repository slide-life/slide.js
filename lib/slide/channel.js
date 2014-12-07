function Channel (blocks) {
    this.blocks = blocks;
    return this;
}

Channel.prototype.create = function (cb) {
    var self = this;
    Slide.crypto.generateKeys(384, '', function (keys, carry) {
        self.publicKey = keys.pub;
        self.privateKey = keys.sec;
        $.ajax({
            type: 'POST',
            url: 'http://' + Slide.host + '/channels',
            contentType: 'application/json',
            data: JSON.stringify({
                key: self.publicKey,
                blocks: self.blocks
            }),
            success: function (data) {
                self.id = data.id;

		if( cb.onCreate || cb.listen ) {
		  if (!!cb.onCreate) {
		      cb.onCreate();
		  }

		  if (!!cb.listen) {
		      if (cb.listen === true) {
			  self.listen();
		      } else {
			  self.listen(cb.listen);
		      }
		  }
		} else {
		  var channel = new Channel(data.blocks);
		  channel.id = data.id;
		  cb(channel, keys);
		}
            }
        });
    }, null, this);
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

Channel.prototype.updateState = function (state, cb) {
    $.ajax({
        type: 'PUT',
        url: this.getURL(),
        contentType: 'application/json',
        data: JSON.stringify({
            open: state
        }),
        success: cb
    });
};

Channel.prototype.open = function (cb) {
    this.updateState(true, cb);
};

Channel.prototype.close = function (cb) {
    this.updateState(false, cb);
};

Channel.prototype.listen = function (cb) {
    var socket = new WebSocket(this.getWSURL());
    var self = this;
    socket.onmessage = function (event) {
        cb(JSON.parse(event.data), self.privateKey);
    };
};

Channel.prototype.prompt = function (cb) {
    var self = this;
    this.create({
        onCreate: function () {
            var frame = $('<iframe/>', {
                src: 'http://localhost:8000/frames/prompt.html?channel=' + self.id,
                id: 'slide-bucket-frame'
            });
            $('#modal .modal-body').append(frame);
            $('#modal').modal('toggle');
        },
        listen: function (data) {
	  $('#modal').modal('toggle');
	  try { frame.remove(); } catch(err) { /* frame may not be defined */ }
	  cb && cb(data.fields, data.cipherkey);
        }
    });
};

export default Channel;
