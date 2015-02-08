var API = require('./api');

function BrowserAPI () {}

BrowserAPI.prototype = new API();

BrowserAPI.prototype._enableJSON = function (options) {
  if (options.data) { options.data = JSON.stringify(options.data); }
  options.contentType = 'application/json; charset=utf-8';
  options.dataType = 'json';
};

BrowserAPI.prototype.get = function (path, options) {
  this._escapeQueryString(options.data);
  options.url = this.endpoint(path);
  options.type = 'GET';
  options.dataType = 'json';
  $.ajax(options);
};

BrowserAPI.prototype.post = function (path, options) {
  options.url = this.endpoint(path);
  options.type = 'POST';
  this._enableJSON(options);
  $.ajax(options);
};

BrowserAPI.prototype.put = function (path, options) {
  options.url = this.endpoint(path);
  options.type = 'PUT';
  this._enableJSON(options);
  $.ajax(options);
};

BrowserAPI.prototype.patch = function (path, options) {
  options.url = this.endpoint(path);
  options.type = 'PATCH';
  this._enableJSON(options);
  $.ajax(options);
};

BrowserAPI.prototype.socket = function (path) {
  return new WebSocket(this.endpoint('ws://', path));
};

export = module.exports = BrowserAPI;
