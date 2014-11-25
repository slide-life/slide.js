var slide_crypto = function () {
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
        var sec = slide.crypto.serializeSecretKey(keys.sec);
        var pub = slide.crypto.serializePublicKey(keys.pub);
        var val = slide.crypto.checkKeypair(keys.pub, sec);
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

    this.randomKeyString = function(len) {
        var result = '';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 0; i < len; i++) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    };

    this.encryptString = function(text, pubkey, callback, carry) {
        var rand = slide.crypto.randomKeyString(64);
        var carrier = {
            "cleartext": text,
            "callback": callback,
            "outercarrier": carry,
            "rand": rand,
            "pubkey": pubkey,
            "enckey": new Object()
        };
        setTimeout(function(){
            slide.crypto.encryptStringF(carrier);
        }, slide.crypto.asyncTimeout);
    };

    this.encryptStringF = function(carrier) {
        var pk = carrier.pubkey;
        var pkEnc = pk.encryption.pub;
        slide.crypto.kemAsync(pkEnc, function(symkey, carrier) {
            var sym = sjcl.codec.hex.fromBits(symkey.key);
            var tag = symkey.tag;
            var enckey = slide.crypto.symEncrypt(carrier.rand, sym);
            var keyhash = slide.crypto.hashPublicKey(pk.encryption.pub);
            carrier.enckey = { enckey: enckey, keytag: tag, keyhash: keyhash };
            slide.crypto.symEncryptAsync(carrier.cleartext, carrier.rand, function(ciphertext, carrier) {
                var msg = { "enckey": carrier.enckey, "ciphertext": ciphertext };
                setTimeout(function() {
                    carrier.callback(msg, carrier.outercarrier);
                }, slide.crypto.asyncTimeout);
            }, carrier);
        }, carrier);
    };

    this.kemAsync = function(pub, cb, carrier) {
        //fuck it
        var keyData = pub.kem();
        cb({symkey: {
            key: sjcl.codec.hex.fromBits(keyData.key),
            tag: sjcl.codec.hex.fromBits(keyData.tag)
        }, carrier: carrier});
    };

    this.symEncrypt = function(rand, sym) {
        return sjcl.encrypt(rand, sym);
    };

    this.symEncryptAsync = function(text, rand, cb, carrier) {
        //fuck it
        cb(slide.crypto.symEncrypt(text, rand), carrier);
    };

    this.hashPublicKey = function(pub) {
        var hash1, hash2, c = 0;
        do {
            hash1 = sjcl.hash.sha1.hash(pub);
            hash1 = sjcl.codec.hex.fromBits(hash1);
            hash2 = sjcl.hash.sha1.hash(pub);
            hash2 = sjcl.codec.hex.fromBits(hash2);
            c++;
        } while (hash1 != hash2 && c <= 3);
        return hash1;
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
    };

    this.checkKeypair = function(pub, sec) {
        var v_pub = slide.crypto.checkPublicKey(pub);
        var v_sec = slide.crypto.checkSecretKey(sec);
        return (v_pub && v_sec);
    };

    this.checkPublicKey = function(pub) {
        try {
            return pub._point.isValid();
        } catch (e) {
            return false;
        }
    };

    this.checkSecretKey = function(sec) {
        if (typeof sec == "String" || typeof sec == "string") {
            try {
                var dser = slide.crypto.deserializeSecretKey(sec);
                return ((typeof dser == "object" || typeof dser == "Object") && dser != null);
            } catch (e) {
                return false;
            }
        } else {
            try {
                var ser = slide.crypto.serializeSecretKey(sec);
                var dser = slide.crypto.deserializeSecretKey(ser);
                return ((typeof dser == "object" || typeof dser == "Object") && dser != null);
            } catch (e) {
                return false;
            }
        }
    };
};

slide = new Object();
slide.crypto = new slide_crypto();
