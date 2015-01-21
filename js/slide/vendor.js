import api from './api';
import User from './user';

var Vendor = function(name, chk, id, keys) {
  if( keys ) {
    this.publicKey = keys.pub;
    this.privateKey = keys.priv;
    this.symmetricKey = keys.sym;
    this.checksum = chk || Slide.crypto.encryptStringWithPackedKey('', pub);
  }
  this.name = name;
  this.id = id;
};

$.extend(Vendor.prototype, User.prototype);

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
  var keys = { pub: obj.publicKey, priv: obj.privateKey, sym: obj.symmetricKey }; 
  var vendor;
  if( keys.pub || keys.priv || keys.sym ) {
    vendor = new Vendor(obj.name, obj.checksum, obj.id, keys);
  } else {
    vendor = new Vendor(obj.name, obj.checksum, obj.id);
  }
  vendor.invite = obj.invite_code;
  return vendor;
};

Vendor.load = function(fail, success) {
  if( window.localStorage.vendor ) {
    success(this.fromObject(JSON.parse(window.localStorage.vendor)));
  } else {
    fail(success);
  }
};

Vendor.invite = function(name, cb) {
  $.post(Slide.endpoint("/admin/vendors"),
    JSON.stringify({name: name}),
    function(vendor) {
      cb(Vendor.fromObject(vendor));
    });
};

$.put = function(url, payload, cb) {
  $.ajax({ url: url, type: 'PUT', data: payload, success: cb });
};
Vendor.prototype.register = function(cb) {
  var invite = this.invite, name = this.name, id = this.id;
  var keys;
  Slide.crypto.generateKeys(function(k) {
    keys = Slide.crypto.packKeys(k);
  });
  var symmetricKey = Slide.crypto.AES.generateKey();
  var key = Slide.crypto.encryptStringWithPackedKey(symmetricKey, keys.publicKey);
  this.publicKey = keys.publicKey;
  this.privateKey = keys.privateKey;
  this.symmetricKey = symmetricKey;
  this.checksum = Slide.crypto.encryptStringWithPackedKey("", keys.publicKey);
  var self = this;
  $.put(Slide.endpoint("/vendors/" + id),
    JSON.stringify({
      invite_code: invite,
      key: key,
      public_key: keys.publicKey,
      checksum: this.checksum
    }),
    function(v) {
      this.id = v.id;
      cb && cb(self);
    });
};

Vendor.prototype.listen = function(cb) {
  var socket = api.socket('ws://', '/vendors/' + this.number + '/listen');
  var self = this;
  socket.onmessage = function (event) {
    console.log('refresh');
  };
};

Vendor.prototype.createForm = function(name, formFields, cb) {
  var payload = {
    name: name,
    form_fields: formFields,
    checksum: this.checksum
  };
  $.post(Slide.endpoint("/vendors/" + this.id + "/vendor_forms"),
    JSON.stringify(payload),
    function(form) {
      cb && cb(Slide.VendorForm.fromObject(form));
    });
};

export default Vendor;

