var assert = require('assert');
var Crypto = require('../../lib/utils/crypto');

describe('Crypto', function () {
  describe ('RSA#**cryptSymmetricKey()', function () {
    it('decrypt should be the inverse of encrypt', function () {
      var rsa = Crypto.RSA.packKeys(Crypto.RSA.generateKeysSync());
      var symmetric = Crypto.AES.generateKey();
      assert.equal(symmetric,
        Crypto.RSA.decryptSymmetricKey(
          Crypto.RSA.encryptSymmetricKey(
            symmetric, rsa.public),
          rsa.private
        )
      );
    });
  });
});
