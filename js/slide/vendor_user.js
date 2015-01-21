import api from './api';
import User from './user';

var VendorUser = function(uuid) {
  this.uuid = uuid;
};

VendorUser.prototype.fromObject = function(obj) {
  this.name = obj.name;
  this.description = obj.description;
  this.formFields = obj.formFields;
  this.vendor = obj.vendor;
  this.checksum = obj.checksum || Slide.crypto.encryptStringWithPackedKey("", obj.symmetricKey);
  this.privateKey = obj.privateKey;
  this.symmetricKey = obj.symmetricKey;
};

VendorUser.prototype.load = function(user, cb) {
  var self = this;
  $.get(Slide.endpoint("/vendor_users/" + this.uuid),
    function(vendor) {
      self.fromObject(vendor, user);
      cb(self);
    });
};

VendorUser.createRelationship = function(user, vendor, cb) {
  var keys;
  Slide.crypto.generateKeys(function(k) {
    keys = k;
  });
  var key = Slide.crypto.AES.generateKey();
  var userKey = Slide.crypto.encryptStringWithPackedKey(key, vendor.publicKey);
  var vendorKey = Slide.crypto.encryptStringWithPackedKey(key, vendor.publicKey);
  var checksum = Slide.crypto.encryptStringWithPackedKey("", user.publicKey);
  api.post("/vendors/"+vendor.id+"/vendor_users", {
    data: {
      key: key, 
      public_key: user.publicKey,
      checksum: checksum,
      vendor_key: vendorKey
    },
    success: function(vendor) {
      vendor.checksum = checksum;
      vendor.symmtricKey = key;
      var vendorUser = new VendorUser(vendor.uuid);
      vendorUser.fromObject(vendor);
      cb && cb(vendorUser);
    }
  });
};

VendorUser.prototype.loadVendorForms = function(cb) {
  api.get('/vendor_users/' + this.uuid + '/vendor_forms', {
    success: function(vendorForms) {
      var vendorFormHash = {};
      vendorForms.forEach(function(vf) {
        var vendorForm = Slide.VendorForm.fromObject(vf);
        vendorFormHash[vendorForm.name] = vendorForm;
      });
      cb(vendorFormHash);
    }
  });
};

$.extend(VendorUser.prototype, User.prototype);

export default VendorUser;

