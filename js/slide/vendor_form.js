var VendorForm = function(name, fields, vendorId) {
  this.name = name;
  this.fields = fields;
  this.vendor = vendorId;
};

VendorForm.get = function(id, cb) {
  $.get(Slide.endpoint("/vendor_forms/" + id),
    function(vendor) {
      cb(VendorForm.fromObject(vendor));
    });
};

VendorForm.prototype.initialize = function(cb) {
  var self = this;
  // TODO: perhaps allow a vendor form to be posted after the fact
};

VendorForm.fromObject = function(obj) {
  var form = new VendorForm(obj.name, obj.form_fields, obj.vendor_id);
  form.id = obj.id;
  return form;
};

export default VendorForm;

