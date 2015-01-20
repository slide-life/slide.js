var VendorForm = function(name, fields, vendorId) {
  this.name = name;
  this.fields = fields;
  this.vendor = vendorId;
};

VendorForm.prototype.initialize = function(cb) {
  $.post(Slide.endpoint("/vendors/" + this.vendorId + "/vendor_forms"),
    JSON.stringify({
      form_fields: this.fields,
      name: this.name,
      fields: this.fields
    }),
    function(form) {
      console.log(form);
      cb && cb(form);
    });
};

VendorForm.fromObject = function(obj) {
  var form = new VendorForm(obj.name, obj.form_fields, obj.vendor_id);
  form.id = obj.id;
  return form;
};

export default VendorForm;

