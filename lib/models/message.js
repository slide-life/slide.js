function Message () { }

function Request () { }
Request.prototype = Object.create(Message.prototype);

function Response () { }
Response.prototype = Object.create(Message.prototype);

function Deposit () { }
Deposit.prototype = Object.create(Message.prototype);

exports = module.exports = {
  Request: Request,
  Response: Response,
  Deposit: Deposit
};
