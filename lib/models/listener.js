function Listener () { }

Listener.buildWebhook = function (scope, url, method) {
  var listener = new Listener();
  listener.relationshipId = scope.relationshipId;
  listener.conversationId = scope.conversationId;
  listener.messageType = scope.messageType;
  listener.url = url;
  listener.method = method;
  return listener;
};

exports = module.exports = Listener;
