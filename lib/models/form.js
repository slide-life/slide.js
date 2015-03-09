var API = require('../utils/api');

var Vendor = require('./vendor');

function Form (name, description, fields) {
  this.name = name;
  this.description = description;
  this.fields = fields;
}

Form.fromObject = function (obj) {
  var form = new Form(obj.name, obj.description, obj.formFields);
  form.id = obj.id;
  return form;
};

Form.prototype.toObject = function () {
  return ({
    formFields: this.fields,
    name: this.name,
    description: this.description
  });
};

Form.prototype.getFlattenedFieldNames = function (cb) {
  var self = this;
  Slide.Card.getSchemasForFields(this.fields, function (schemas) {
    cb([].concat.apply([], self.fields.map(function (field) {
      return Slide.Card.getDescendants(schemas[field]);
    })));
  });
};

exports = module.exports = Form;
