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
  if (obj.message_type === 'request') {
    message = new Request();
    message.blocks = obj.blocks;
  } else if (obj.message_type === 'deposit') {
    message = new Deposit();
    message.data = obj.data;
  } else if (obj.message_type === 'response') {
    message = new Response();
    message.data = obj.data;
  }

  message.id = obj.id;
  message.conversationId = obj.conversation_id;

  return message;
};

exports = module.exports = Message;
