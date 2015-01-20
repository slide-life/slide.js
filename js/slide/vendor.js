import api from './api';
import User from './user';

var Vendor = function(name, pub, priv, key, chk, id) {
  this.publicKey = pub;
  this.privateKey = priv;
  this.symmetricKey = key;
  this.checksum = chk || Slide.crypto.encryptStringWithPackedKey('', pub);
  this.name = name;
  this.id = id;
};

Vendor.prototype = User.prototype;
Vendor.prototype.persist = function() {
  var obj = {
    number: this.number,
    publicKey: this.publicKey,
    privateKey: this.privateKey,
    symmetricKey: this.symmetricKey,
    checksum: this.checksum,
    id: this.id
  };
  window.localStorage.vendor = JSON.stringify(obj);
};

Vendor.fromObject = function(obj) {
  return new Vendor(obj.name, obj.publicKey, obj.privateKey, obj.symmetricKey, obj.checksum, obj.id);
};

Vendor.load = function(fail, success) {
  if( window.localStorage.vendor ) {
    console.log('loaded');
    success(this.fromObject(JSON.parse(window.localStorage.vendor)));
  } else {
    fail(success);
  }
};

Vendor.invite = function(name, cb) {
  api.post('/admin/vendors', {
    data: { name: name },
    success: function (vendor) {
      cb(vendor.invite_code, vendor.id);
    }
  });
};

Vendor.register = function(invite, id, name, cb) {
  var keys;
  Slide.crypto.generateKeys(function(k) {
    keys = Slide.crypto.packKeys(k);
  });
  var symmetricKey = Slide.crypto.AES.generateKey();
  var key = Slide.crypto.encryptStringWithPackedKey(symmetricKey, keys.publicKey);
  var vendor = new this(name, keys.publicKey, keys.privateKey, symmetricKey);
  vendor.checksum = Slide.crypto.encryptStringWithPackedKey('', keys.publicKey);
  console.log('posintg', id);
  $.put(Slide.endpoint('/vendors/' + id),
    JSON.stringify({
      invite_code: invite,
      key: key,
      public_key: keys.publicKey,
      checksum: vendor.checksum
    }),
    function(v) {
      vendor.id = v.id;
      cb && cb(vendor);
    });
};

Vendor.prototype.listen = function(cb) {
  var socket = api.socket('ws://', '/vendors/' + this.number + '/listen');
  var self = this;
  socket.onmessage = function (event) {
    console.log('refresh');
  };
};

Vendor.prototype.createForm = function(name, formFields) {
  ajax.post('/vendors/' + this.id + '/vendor_forms', {
    data: {
      name: name,
      form_fields: formFields,
      checksum: this.checksum
    }
  });
};

export default Vendor;

