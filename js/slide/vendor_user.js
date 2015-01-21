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
  this.checksum = obj.checksum || Slide.crypto.encryptStringWithPackedKey('', obj.key);
};

VendorUser.prototype.load = function(cb) {
  var self = this;
  api.get('/vendor_users/' + this.uuid, {
    success: function (vendorUserData) {
      self.fromObject(vendorUserData);
      cb(self);
    }
  });
};

// VendorUser.createRelationship = api.post(/vendors/:id/vendors_users,
//   {key, public_key, checksum, vendor_key})

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

