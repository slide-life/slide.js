function Channel(blocks) {
    this.blocks = blocks;
}

Channel.prototype.open = function (cb) {
    Slide.crypto.generateKeys(384, '', function(keys, carry) {
        this.sec = keys.sec;
        this.pub = keys.pub;
        $.ajax({
            type: 'POST',
            url: 'http://' + HOST + '/channels',
            contentType: 'application/json',
            data: JSON.stringify({
                key: keys.pub,
                blocks: blocks
            }),
            success: function (data) {
                var channel = data.__id.$oid;
                cb.onCreate(channel);
                var socket = new WebSocket('ws://' + HOST + '/channels/' + channel + '/listen');
                socket.onmessage = cb.onBlockReceived;
            }
        });
    }, null, 0);
}

export default Channel;
