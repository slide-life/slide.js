import Crypto from './crypto';

var Securable = function(pub, priv, key) {
  this.loadWithKeys(pub, priv, key);
};

Securable.prototype.loadWithKeys = function(pub, priv, key) {
  this.publicKey = pub;
  this.privateKey = priv;
  this.symmetricKey = key;
};

Securable.prototype.generate = function() {
  Crypto.generateKeys(function(k) {
    this.publicKey = k.publicKey;
    this.privateKey = k.privateKey;
    this.symmetricKey = Crypto.AES.generateKey();
  });
};

Securable.prototype.encryptedSymKey = function() {
  return Crypto.encryptStringWithPackedKey(this.symmetricKey, this.publicKey);
};

Securable.prototype.checksum = function() {
  return Crypto.encryptStringWithPackedKey('', this.symmetricKey);
};

Securable.prototype.decrypt = function(data) {
  return Crypto.AES.decryptData(data, this.symmetricKey);
};

Securable.prototype.encrypt = function(data) {
  return Crypto.AES.encryptData(data, this.symmetricKey);
};
