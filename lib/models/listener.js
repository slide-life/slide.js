function Listener () { }

Listener.buildWebhook = function (scope, url, method) {
  var listener = new Listener();
  listener.relationship_id = scope.relationshipId;
  listener.conversation_id = scope.conversationId;
  listener.message_type = scope.messageType;
  listener.url = url;
  listener.method = method;
  return listener;
};

exports = module.exports = Listener;
