export default {
  var rsa = forge.pki.rsa;
  generateKeys: function (cb) {
    // This is a synchronous function, designed with a callback for the future.
    cb(rsa.generateKeyPair({ bits: 512, e: 0x10001 }));
  },

  packPublicKey: function (key) {
    return btoa(forge.pki.publicKeyToPem(key));
  },
  packPrivateKey: function (key) {
    return btoa(forge.pki.privateKeyToPem(key));
  },

  packKeys: function (keys) {
    return {
      publicKey: this.packPublicKey(keys.publicKey),
      privateKey: this.packPrivateKey(keys.privateKey)
    };
  },

  AES = {
    generateCipher: function() {
      return {
        key: forge.random.getBytesSync(16),
        iv: forge.random.getBytesSync(16)
      };
    },

    _packCipher: function(cipher) {
      return btoa(cipher.key+cipher.iv);
    },

    _unpackCipher: function(packed) {
      var decoded = atob(packed),
          key = decoded.substr(0, 16),
          iv = decoded.substr(16);
      return {key:key,iv:iv};
    },

    generateKey: function() {
      return this._packCipher(this.generateCipher());
    },

    encrypt: function(payload, seed) {
      var unpacked = this._unpackCipher(seed),
          key = unpacked.key,
          iv = unpacked.iv;
      var cipher = forge.cipher.createCipher('AES-CBC', key);
      cipher.start({iv: iv});
      cipher.update(forge.util.createBuffer(payload));
      cipher.finish();
      return cipher.output.toHex();
    },

    decrypt: function(hex, seed) {
      var unpacked = this._unpackCipher(seed),
          key = unpacked.key,
          iv = unpacked.iv;
      var decipher = forge.cipher.createDecipher('AES-CBC', key);
      decipher.start({iv: iv});
      var payload = new forge.util.ByteStringBuffer(forge.util.hexToBytes(hex));
      decipher.update(payload);
      decipher.finish();
      return decipher.output.data;
    },

    decryptData: function(data, key) {
      var clean = {};
      for( var k in data ) {
        clean[k] = this.decrypt(atob(data[k]), key);
      }
      return clean;
    },

    encryptData: function(data, key) {
      var encrypted = {};
      for( var k in data ) {
        encrypted[k] = btoa(this.encrypt(data[k], key));
      }
      return encrypted;
    }
  },

  decryptString: function (text, sec) {
    return sec.decrypt(text);
  },

  decryptData: function (data, sec) {
    var clean = {};
    for( var key in data ) {
      clean[key] = this.decryptString(atob(data[key]), sec);
    }
    return clean;
  },

  encryptString: function (text, pub) {
    return pub.encrypt(text);
  },

  encryptDataWithKey: function (data, pub) {
    var encrypted = {};
    for( var key in data ) {
      encrypted[key] = btoa(this.encryptString(data[key], pub));
    }
    return encrypted;
  },

  encryptData: function (data, pem) {
    var pub = forge.pki.publicKeyFromPem(pem);
    return this.encryptDataWithKey(data, pub);
  },

  encryptStringWithPackedKey: function (text, key) {
    var pub = forge.pki.publicKeyFromPem(atob(key));
    return btoa(pub.encrypt(text));
  },

  decryptStringWithPackedKey: function (text, key) {
    var pub = forge.pki.privateKeyFromPem(atob(key));
    return pub.decrypt(atob(text));
  }
};
