function Message () { }

function Request () { }
Request.prototype = Object.create(Message.prototype);

function Response () { }
Response.prototype = Object.create(Message.prototype);

function Deposit () { }
Deposit.prototype = Object.create(Message.prototype);

Message.Request = Request;
Message.Response = Response;
Message.Deposit = Deposit;

Message.fromObject = function (obj) {
  var message;

  if (obj.messageType === 'request') {
    message = new Request();
    message.blocks = obj.blocks;
    message.read = obj.read;
  } else if (obj.messageType === 'deposit') {
    message = new Deposit();
    message.data = obj.data;
  } else if (obj.messageType === 'response') {
    message = new Response();
    message.data = obj.data;
  }

  message.id = obj.id;
  message.conversationId = obj.conversationId;

  return message;
};

exports = module.exports = Message;
