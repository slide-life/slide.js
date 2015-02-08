function Message () { }

function Request () { }
Request.prototype = new Message();

function Response () { }
Response.prototype = new Message();

function Deposit () { }
Deposit.prototype = new Message();

exports = module.exports = {
  Request: Request,
  Response: Response,
  Deposit: Deposit
};
