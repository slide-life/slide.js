function Channel (data, sec) {
    this.id = data.id;
    this.publicKey = data.key;
    this.privateKey = sec;
    return this;
}

Channel.create = function (blocks, cb) {
    Slide.crypto.generateKeys(384, '', function (keys, carry) {
        sec = keys.sec;
        //post
        $.ajax({
            type: 'POST',
            url: 'http://' + Slide.host + '/channels',
            contentType: 'application/json',
            data: JSON.stringify({
                key: keys.pub,
                blocks: blocks
            }),
            success: function (data) {
                cb(new Channel(data, sec));
            }
        });
    }, null, 0);
};

Channel.prototype.getWSURL = function() {
    return 'ws://' + Slide.host + '/channels/' + this.id + '/listen';
};

Channel.prototype.getURL = function() {
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

Channel.prototype.listen = function (cb) {
    var socket = new WebSocket(this.getWSURL());
    socket.onmessage = function (event) {
        cb(JSON.parse(event.data));
    };
};

export default Channel;
