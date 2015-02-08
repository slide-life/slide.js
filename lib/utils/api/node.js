var API = require('./api');

var ws = require('ws');
var request = require('request');

function NodeAPI () {}

NodeAPI.prototype = Object.create(API.prototype);

NodeAPI.prototype._retrieveBody = function (response, cb) {
  var data = '';

  response.on('data', function (chunk) {
    data += chunk;
  });

  response.on('end', function() {
    cb(JSON.parse(data));
  });
};

NodeAPI.prototype._bindCallbacks = function (req, options) {
  var self = this;
  var failure;

  req.on('response', function (response) {
    if (response.statusCode < 400) {
      self._retrieveBody(response, options.success);
    } else {
      if (options.failure) {
        self._retrieveBody(response, options.failure);
      } else {
        throw new Error('Request failed with no handler');
      }
    }
  });
};

NodeAPI.prototype.get = function (path, options) {
  this._escapeQueryString(options.data);
  var req = request({
    method: 'GET',
    url: this.endpoint(path),
    qs: options.data
  });
  this._bindCallbacks(req, options);
};

NodeAPI.prototype.post = function (path, options) {
  var req = request({
    method: 'POST',
    url: this.endpoint(path),
    body: options.data,
    json: true
  });
  this._bindCallbacks(req, options);
};

NodeAPI.prototype.put = function (path, options) {
  var req = request({
    method: 'PUT',
    url: this.endpoint(path),
    body: options.data,
    json: true
  });
  this._bindCallbacks(req, options);
};

NodeAPI.prototype.patch = function (path, options) {
  var req = request({
    method: 'PATCH',
    url: this.endpoint(path),
    body: options.data,
    json: true
  });
  this._bindCallbacks(req, options);
};

NodeAPI.prototype.socket = function (path) {
  return new WebSocket(this.endpoint('ws://', path));
};

exports = module.exports = NodeAPI;
