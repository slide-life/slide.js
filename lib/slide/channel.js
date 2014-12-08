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

Channel.prototype.toObject = function() {
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

Channel.prototype.create = function (cb) {
    var self = this;
    Slide.crypto.generateKeys(function (keys) {
        self.publicKey = keys.publicKey;
        self.privateKey = keys.privateKey;
    	var pem = forge.util.encode64(forge.pki.publicKeyToPem(self.publicKey));
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

        		if (!!cb) {
                    cb(self);
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
        cb(Slide.crypto.decryptData(JSON.parse(event.data), self.privateKey));
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
    if (bucketPrompt) {
      listeners.onCreate();
    }
    else this.create(listeners);
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
