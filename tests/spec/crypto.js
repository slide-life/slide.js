require('../mocks');
var assert = require('assert');
var Crypto = require('../../build/utils/crypto.js').default;
var Slide = require('../../build/slide').default;

describe('Crypto', function () {

  describe(".prettyPayload", function() {
    it("is lossless", function(done) {
      for( var i = 0; i < 50; i++ ) {
        var key = Crypto.AES.generateKey();
        var pretty = Crypto.prettyPayload(key);
        var id = Crypto.uglyPayload(pretty);
        assert.equal(id, key);
      }
      done();
    });
  });

  describe(".encrypt", function() {
    it("is lossless", function(done) {
      var key = Crypto.AES.generateKey();
      var field = "" + Math.floor(Math.random() * 1000);
      var id = Crypto.AES.decrypt(Crypto.AES.encrypt(field, key), key);
      assert.equal(field, id);
      done();
    });
  }),

  describe(".encryptKey", function() {
    it("losslessly encrypts keys", function(done) {
      var key = Crypto.AES.generateKey();
      var keypair = Crypto.generateKeysSync();
      var pub = keypair.publicKey,
          priv = keypair.privateKey;
      var id = Crypto.AES.decryptKey(Crypto.AES.encryptKey(key, pub), priv);
      assert.equal(Crypto.AES.prettyKey(key),
        Crypto.AES.prettyKey(id));
      done();
    });
  });

});

