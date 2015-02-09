var base64 = require('./base64');

exports = module.exports = function (forge) {
  return {
    /* Key generation */

    generateKeys: function (cb) {
      // This is a synchronous function, designed with a callback for the future.
      var keys = forge.pki.rsa.generateKeyPair({ bits: 512, e: 0x10001 });
      cb({
        public: keys.publicKey,
        private: keys.privateKey
      });
    },

    generateKeysSync: function () {
      // This won't work when generate keys becomes synchronous
      var keys;
      this.generateKeys(function (k) {
        keys = k;
      });
      return keys;
    },

    /* Packing and unpacking */

    packPublicKey: function (key) {
      return base64.encode(forge.pki.publicKeyToPem(key));
    },

    packPrivateKey: function (key) {
      return base64.encode(forge.pki.privateKeyToPem(key));
    },

    packKeys: function (keys) {
      return {
        public: this.packPublicKey(keys.public),
        private: this.packPrivateKey(keys.private)
      };
    },

    unpackPublicKey: function (key) {
      return forge.pki.publicKeyFromPem(base64.decode(key));
    },

    unpackPrivateKey: function (key) {
      return forge.pki.privateKeyFromPem(base64.decode(key));
    },

    unpackKeys: function (keys) {
      return {
        public: this.packPublicKey(keys.public),
        private: this.packPrivateKey(keys.private)
      };
    },

    /* Encryption and decryption */

    encrypt: function (text, publicKey) {
      return this.unpackPublicKey(publicKey).encrypt(text);
    },

    decrypt: function (text, privateKey) {
      return this.unpackPrivateKey(privateKey).decrypt(text);
    },

    encryptSymmetricKey: function (symmetric, key) {
      return base64.encode(this.encrypt(symmetric, key));
    },

    decryptSymmetricKey: function (symmetric, key) {
      return this.decrypt(base64.decode(symmetric), key);
    }
  };
};
