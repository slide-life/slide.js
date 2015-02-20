var API = require('../utils/api');

var Vendor = require('./vendor');

function Form (name, description, fields) {
  this.name = name;
  this.description = description;
  this.fields = fields;
}

Form.fromObject = function (obj) {
  var form = new Form(obj.name, obj.description, obj.form_fields);
  form.id = obj.id;
  return form;
};

Form.prototype.toObject = function () {
  return ({
    form_fields: this.fields,
    name: this.name,
    description: this.description
  });
};

exports = module.exports = Form;
