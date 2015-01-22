// TODO: make view directory an argument
function formQueryString(hash) {
  var parts = [];
  for( var k in hash ) {
    parts.push([k, hash[k]].join("="));
  }
  return "?"+parts.join("&");
}

var cbs = {};
window.addEventListener("message", function(evt) {
  var data = JSON.parse(evt.message || evt.data);
  cbs[data.channel](data.value);
  delete cbs[data.channel];
}, false);

var iframe;
var Storage = {
  accessor: function(payload) {
    var iframe = $("<iframe>", {
      src: "/slide.js/dist/views/auth.html" + formQueryString(payload)
    });
    iframe.hide();
    $("body").append(iframe);
  },
  persist: function(key, value) {
    this.accessor({
      verb: "set",
      key: key,
      value: value
    });
  },
  access: function(key, cb) {
    var channel = Math.floor(Math.random() * 10000);
    cbs[channel] = cb;
    this.accessor({
      verb: "get",
      key: key,
      channel: channel
    });
  }
};

export default Storage;

