import User from './user';

var Vendor = function(name, pub, priv, key) {
  User.call(this, "", pub, priv, key);
  this.name = name;
};
Vendor.prototype = User.prototype;
Vendor.prototype.persist = function() {
  var obj = {
    number: this.number,
    publicKey: this.publicKey,
    privateKey: this.privateKey,
    symmetricKey: this.symmetricKey
  };
  window.localStorage.user = JSON.stringify(obj);
};
Vendor.load = function(fail, success) {
  if( window.localStorage.user ) {
    success(this.fromObject(JSON.parse(window.localStorage.vendor)));
  } else {
    fail(success);
  }
};
Vendor.register = function(number, cb) {
  var keys;
  var vendor = new this();
  Slide.crypto.generateKeys(function(k) {
    keys = Slide.crypto.packKeys(k);
  });
  var symmetricKey = Slide.crypto.AES.generateKey();
  var key = Slide.crypto.encryptStringWithPackedKey(symmetricKey, keys.publicKey);
  vendor.symmetricKey = symmetricKey;
  vendor.publicKey = keys.publicKey;
  vendor.privateKey = keys.privateKey;
  vendor.name = name;
  $.post(Slide.endpoint("/vendors"),
    JSON.stringify({ key: key, public_key: keys.publicKey, name: vendor.name }),
    function(v) {
      vendor.id = v.id;
      cb && cb(vendor);
    });
};
Vendor.prototype.listen = function(cb) {
  var socket = new WebSocket(Slide.endpoint('ws://', '/vendors/' + this.number + '/listen'));
  var self = this;
  socket.onmessage = function (event) {
    console.log("refresh");
  };
};

export default Vendor;

