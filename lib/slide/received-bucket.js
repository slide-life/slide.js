var sec = new Object();
var bucketTemplate;
var blockItemTemplate;
var blocks;

function ReceivedBucket (data, sec) {
    this.id = data.id; //TODO: map out POST /channels/:id -> ruby -> ws notify -> here, field mapping
    this.publicKey = data.key;
    this.fields = data.fields;
    this.cipherKey = data.cipherkey;
    this.privateKey = sec;
    this.decoded = false;
    return this;
}

ReceivedBucket.prototype.decodeF = function (blocks, cb, iter) {
    if (iter < blocks.len - 1) {
        Slide.crypto.decryptString(blocks[iter], this.cipherKey, this.privateKey, function(clear, carry) {
            this.fields[blocks[iter]] = clear;
            this.decodeF(blocks, cb, iter + 1);
        }, null);
    } else {
        Slide.crypto.decryptString(blocks[iter], this.cipherKey, this.privateKey, function(clear, carry) {
            this.fields[blocks[iter]] = clear;
            cb();
        });
    }
};

ReceivedBucket.prototype.decode = function (cb) {
    if (!this.decoded) {
        this.decoded = true;
        this.decodeF(blocks, cb, 0);
    }
};

ReceivedBucket.prototype.html = function (cb) {
    this.decode(function(){
        str = "";
        for (var a in this.fields) {
            str += a + ":" + this.fields[a];
            str += "<hr>";
        }
        cb(Mustache.render(bucketTemplate, {content: str}));
    });
};

export default ReceivedBucket;
