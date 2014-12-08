function Channel (blocks) {
    this.blocks = blocks;
    return this;
}

Channel.prototype.create = function (cb) {
    var self = this;
    Slide.crypto.generateKeys(function (keys) {
        self.publicKey = keys.publicKey;
        self.privateKey = keys.privateKey;
	var pem = forge.util.encode64(forge.pki.publicKeyToPem(self.publicKey));
	window.pem = forge.util.decode64(pem);
        $.ajax({
            type: 'POST',
            url: 'http://' + Slide.host + '/channels',
            contentType: 'application/json',
            data: JSON.stringify({
                key: forge.util.encode64(forge.pki.publicKeyToPem(self.publicKey)),
                blocks: self.blocks
            }),
            success: function (data) {
                self.id = data.id;

		if (!!cb.onCreate) {
		    cb.onCreate(self, keys);
		}

		if (!!cb.listen) {
		    if (cb.listen === true) {
			self.listen();
		    } else {
			self.listen(cb.listen);
		    }
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
    var bucketPrompt = !cb;
    var self = this;
    var listeners = {
        onCreate: function () {
            self.frame = $('<iframe/>', {
                src: 'frames/prompt.html?channel=' + self.id,
                id: 'slide-bucket-frame'
            });
            $('#modal .modal-body').append(self.frame);
            $('#modal').modal('toggle');
        },
        listen: function (data) {
	  $('#modal').modal('toggle');
	  self.frame.remove();
	  cb && cb(data.fields);
        }
    };
    if( bucketPrompt ) {
      listeners.onCreate();
    }
    else this.create(listeners);
};

export default Channel;

