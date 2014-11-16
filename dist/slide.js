function slide_crypto() {
    this.symmetricAlgorithm = "aes-twofish";
    this.asyncTimeout = 10;

    this.generateKeys = function(bits, pass, callback, carry, depth) {
        depth = typeof depth !== 'undefined' ? depth : 0;
        pass = typeof pass !== 'undefined' ? pass : ''; //in case of pin
        slide.crypto.generateKeysF(bits, pass, function(keys, carry) {
            if (keys == null && depth < 3) {
                slide.crypto.generateKeys(bits, pass, callback, carry, depth + 1);
            } else {
                callback(keys, carry);
            }
        }, carry);
    };

    this.generateKeysF = function(bits, pass, callback, carry) {
        var carrier = {"callback": callback, "outercarrier": carry};
        carrier.bits = bits; carrier.pass = pass;
        if (bits != 192 && bits != 224 && bits != 256 && bits != 384 && bits != 512) {
            bits = 512;
        }
        if (bits == 384) {
            sjcl.ecc.elGamal.generateKeysAsync(192, 10, function(keys, carrier) {
                sjcl.ecc.elGamal.generateKeysAsync(384, 10, function(keys, carrier) {
                    setTimeout(function() {
                        slide.crypto.processKeys(keys, carrier);
                    }, slide.crypto.asyncTimeout);
                }, carrier);
            }, carrier);
        } else {
            sjcl.ecc.elGamal.generateKeysAsync(bits, 10, function(keys, carrier) {
                setTimeout(function() {
                    slide.crypto.processKeys(keys, carrier);
                }, slide.crypto.asyncTimeout);
            }, carrier);
        }
    };

    this.processKeys = function(keys, carrier) {
        var sec = slide.crypto.serializeSecretKey(keys.sec, "elGamal");
        var pub = slide.crypto.serializePublicKey(keys.pub, "elGamal");
        var val = slide.crypto.checkKeypair(pub, sec, "elGamal");
        if (!val) {
            var cb = carrier.callback;
            carrier = carrier.outercarrier;
            setTimeout(function() {
                cb(null, carrier);
            }, slide.crypto.asyncTimeout);
            return;
        }
        carrier.pub = pub;
        carrier.sec = sec;
        setTimeout(function() {
            slide.crypto.processKeysF(carrier);
        }, slide.crypto.asyncTimeout);
    };

    this.processKeysF = function(carrier) {
        var pass = carrier.pass;//unused
        var pub = carrier.pub;
        var sec = carrier.sec;
        var keys = {pub: pub,
            sec: sec};
        var cb = carrier.callback;
        carrier = carrier.outercarrier;
        setTimeout(function() {
            cb(keys, carrier);
        }, slide.crypto.asyncTimeout);
    };

    this.decryptString = function(text, cipherkey, sec, cb, carrier) {
        sec = slide.crypto.deserializeSecretKey(sec);
        sec.unkemAsync(cipherkey, function(sym, carrier) {
            setTimeout(function() {
                cb(sjcl.decrypt(sym, text), carrier);
            }, slide.crypto.asyncTimeout);
        });
    };

    this.serializeSecretKey = function(sec) {
        var exponent = sec._exponent.toBits();
        var curve = sec._curve.b.exponent;
        var sec_json = {exponent: exponent, curve: curve};
        return JSON.stringify(sec_json);
    };

    this.deserializeSecretKey = function(sec) {
        sec = JSON.parse(sec);
        var exponent = sec.exponent;
        var curve = sec.curve;
        exponent = sjcl.bn.fromBits(exponent);
        var sec_obj = new sjcl.ecc.elGamal.secretKey(sjcl.ecc.curves['c' + curve], exponent);
        return sec_obj;
    }

    this.serializePublicKey = function(pub) {
        var point = pub._point.toBits();
        var curve = pub._curve.b.exponent;
        var pub_json = {point: point, curve: curve};
        return JSON.stringify(pub_json);
    };

    this.deserializePublicKey = function(pub) {
        pub = JSON.parse(pub);
        var bits = pub.point;
        var curve = pub.curve;
        var point = sjcl.ecc.curves['c'+curve].fromBits(bits);
        var pubkey = new sjcl.ecc.elGamal.publicKey(point.curve, point);
        return pubkey;
    }
}
;var HOST = 'slide-dev.ngrok.com';

$('body').append('<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title text-center" id="modal-label">slide</h4></div><div class="modal-body"></div></div></div></div>');

function Bucket (data, sec) {
    this.id = data.id;
    this.publicKey = data.key;
    this.privateKey = sec;
    return this;
}

Bucket.prototype.listen = function (cb) {
    var socket = new WebSocket('ws://' + HOST + '/buckets/' + this.id + '/listen');
    socket.onmessage = function (event) {
        cb(JSON.parse(event.data));
    }
};

Bucket.prototype.prompt = function (cb) {
    var frame = $('<iframe/>', {
        src: 'http://localhost:8000/frames/prompt.html?bucket=' + this.id,
        id: 'slide-bucket-frame'
    });
    $('#modal .modal-body').append(frame);
    $('#modal').modal('toggle');

    this.listen(function (data) {
        cb(data.fields, data.cipherkey, data.sec);
        $('#modal').modal('toggle');
        frame.remove();
    });
};

var Slide = {
    extractFields: function (form) {
        return form.find('*').map(function () {
            return $(this).attr('data-slide');
        }).toArray();
    },

    populateFields: function (form, fields, cipherkey, sec) {
        form.find('*').each(function () {
            var field = $(this).attr('data-slide');
            if (!!field && fields[field]) {
                slide.crypto.decryptString(fields[field], cipherkey, sec, function(clear, carry) {
                    $(this).val(fields[field]);
                }, null);
            }
        });
    },

    createBucket: function (fields, cb) {
        slide.crypto.generateKeys(384, '', function(keys, carry) {
            $.ajax({
                type: 'POST',
                url: 'http://' + HOST + '/buckets', 
                    contentType : 'application/json',
                    data: JSON.stringify(fields),
                    success: function (data) {
                        var bucket = new Bucket(data, keys.sec);
                        cb(bucket);
                    }
            });
        }, null, 0);
    },

    createBucketFromForm: function (form, cb) {
        var fields = this.extractFields(form);
        this.createBucket(fields, cb);
    }
}
