import User from './user';

var VendorUser = function(uuid) {
  this.uuid = uuid;
};

VendorUser.prototype.fromObject = function(obj) {
  this.name = obj.name;
  this.description = obj.description;
  this.formFields = obj.formFields;
  this.vendor = obj.vendor;
  this.checksum = obj.checksum || Slide.crypto.encryptStringWithPackedKey("", obj.key);
};

VendorUser.prototype.load = function(cb) {
  var self = this;
  $.get(Slide.endpoint("/vendor_users/" + this.uuid),
        function(vendorUserData) {
          self.fromObject(vendorUserData);
          cb(self);
        });
};

VendorUser.prototype.loadVendorForms = function(cb) {
  $.get(Slide.endpoint("/vendor_users/" + this.uuid + "/vendor_forms"),
        function(vendorForms) {
          var vendorFormHash = {};
          vendorForms.forEach(function(vf) {
            var vendorForm = Slide.VendorForm.fromObject(vf);
            vendorFormHash[vendorForm.name] = vendorForm;
          });
          cb(vendorFormHash);
        });
};

$.extend(VendorUser.prototype, User.prototype);

export default VendorUser;

