var API = require('../utils/api');

function Identifier () { }

function Phone (value) {
  this.value = value;
  this.type = 'phone';
}
Phone.prototype = Object.create(Identifier.prototype);

Phone.prototype.toObject = function () {
  return ({
    id: this.id,
    value: this.value,
    type: this.type
  });
};

function Email (value) {
  this.value = value;
  this.type = 'email';
}
Email.prototype = Object.create(Identifier.prototype);

Identifier.Phone = Phone;
Identifier.Email = Email;

Identifier.fromObject = function (obj) {
  var identifier;
  if (obj.identifier_type === 'phone') {
    identifier = new Phone();
  } else if (obj.identifier_type === 'email') {
    identifier = new Email();
  }

  identifier.value = obj.value;
  identifier.id = obj.id;
  identifier.userId = obj.user_id;
  return identifier;
};

exports = module.exports = Identifier;
