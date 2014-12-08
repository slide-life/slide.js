export default function () {
    var rsa = forge.pki.rsa;
    this.generateKeys = function(cb) {
      rsa.generateKeyPair({
        bits: 2048,
	e: 0x10001,
	workers: -1,
	workerScript: 'https://raw.githubusercontent.com/digitalbazaar/forge/ffcd2db4f3c8547407fd35d92db9b272a8b971f1/js/prime.worker.js'
      }, function(err, keypair) {
        cb(keypair);
      });
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

    this.encryptData = function(data, pem) {
      var encrypted = {};
      var pub = forge.pki.publicKeyFromPem(pem);
      for( var key in data ) {
        encrypted[key] = forge.util.encode64(this.encryptString(data[key], pub));
      }
      return encrypted;
    };
};

