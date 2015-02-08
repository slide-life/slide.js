var base64 = require('./base64');

exports = module.exports = function (forge) {
  return {
    /* Key generation */

    generateKey: function() {
      return this._packCipher(this.generateCipher());
    },

    generateCipher: function() {
      return {
        key: forge.random.getBytesSync(16),
        iv: forge.random.getBytesSync(16)
      };
    },

    _packCipher: function(cipher) {
      return cipher.key+cipher.iv;
    },

    _unpackCipher: function(packed) {
      var decoded = packed,
          key = decoded.substr(0, 16),
          iv = decoded.substr(16);
      return {key:key,iv:iv};
    },

    /* Encryption and decryption */

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
        clean[k] = this.decrypt(base64.decode(data[k]), key);
      }
      return clean;
    },

    encryptData: function(data, key) {
      var encrypted = {};
      for( var k in data ) {
        encrypted[k] = base64.encode(this.encrypt(data[k], key));
      }
      return encrypted;
    }
  };
};
