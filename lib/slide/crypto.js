export default function () {
  var rsa = forge.pki.rsa;
  this.generateKeys = function(cb) {
    // This is a synchronous function, designed with a callback for the future.
    cb(rsa.generateKeyPair({ bits: 512, e: 0x10001 }));
  };

  this.AES = {
    generateCipher: function() {
      return {
        key: forge.random.getBytesSync(16),
        iv: forge.random.getBytesSync(16)
      };
    },
    _packCipher: function(cipher) {
      return btoa(JSON.stringify(this.generateCipher()));
    },
    _unpackCipher: function(packed) {
      return JSON.parse(atob(packed));
    },
    generateKey: function() {
      return this._packCipher(this.generateCipher());
    },
    encrypt: function(payload, key) {
      var unpacked = this._unpackCipher(key),
          key = unpacked.key,
          iv = unpacked.iv;
      var cipher = forge.cipher.createCipher('AES-CBC', key);
      cipher.start({iv: iv});
      cipher.update(forge.util.createBuffer(payload));
      cipher.finish();
      return cipher.output.toHex();
    },
    decrypt: function(hex, key) {
      var unpacked = this._unpackCipher(key),
          key = unpacked.key,
          iv = unpacked.iv;
      var decipher = forge.cipher.createDecipher('AES-CBC', key);
      decipher.start({iv: iv});
      var payload = new forge.util.ByteStringBuffer(forge.util.hexToBytes(hex));
      decipher.update(payload);
      decipher.finish();
      return decipher.output.data;
    }
  };

  this.decryptString = function(text, sec) {
    return sec.decrypt(text);
  };

  this.decryptData = function(data, sec) {
    var clean = {};
    for( var key in data ) {
      clean[key] = this.decryptString(atob(data[key]), sec);
    }
    return clean;
  };

  this.encryptString = function(text, pub) {
    return pub.encrypt(text);
  };

  this.encryptDataWithKey = function(data, pub) {
    var encrypted = {};
    for( var key in data ) {
      encrypted[key] = btoa(this.encryptString(data[key], pub));
    }
    return encrypted;
  };

  this.encryptData = function(data, pem) {
    var pub = forge.pki.publicKeyFromPem(pem);
    return this.encryptDataWithKey(data, pub);
  };
};

