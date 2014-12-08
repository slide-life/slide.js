export default function () {
  var rsa = forge.pki.rsa;
  this.generateKeys = function(cb) {
    // This is a synchronous function, designed with a callback for the future.
    cb(rsa.generateKeyPair({ bits: 512, e: 0x10001 }));
  };

  this.decryptString = function(text, sec) {
    return sec.decrypt(text);
  };

  this.decryptData = function(data, sec) {
    var clean = {};
    for( var key in data ) {
      clean[key] = this.decryptString(forge.util.decode64(data[key]), sec);
    }
    return clean;
  };

  this.encryptString = function(text, pub) {
    return pub.encrypt(text);
  };

  this.encryptDataWithKey = function(data, pub) {
    var encrypted = {};
    for( var key in data ) {
      encrypted[key] = forge.util.encode64(this.encryptString(data[key], pub));
    }
    return encrypted;
  };

  this.encryptData = function(data, pem) {
    var pub = forge.pki.publicKeyFromPem(pem);
    return this.encryptDataWithKey(data, pub);
  };
};

