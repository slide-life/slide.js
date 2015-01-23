var Crypto = require('../../build/slide/crypto.js').default;

var assert = require('assert');
exports = module.exports = function (Slide) {
  describe('Crypto', function () {

    describe(".encrypt", function() {
      var key = Crypto.AES.generateKey();
      var field = "" + Math.floor(Math.random() * 1000);
      var id = Crypto.AES.decrypt(Crypto.AES.encrypt(field, key), key);
      assert.equal(field, id);
    }),

    describe(".encryptKey", function() {
      var key = Crypto.AES.generateKey();
      var keypair = Crypto.generateKeysSync();
      var pub = keypair.publicKey,
          priv = keypair.privateKey;
      var id = Crypto.AES.decryptKey(Crypto.AES.encryptKey(key, pub), priv);
      assert.equal(Crypto.AES.prettyKey(key),
        Crypto.AES.prettyKey(id));
    });

  });
};

