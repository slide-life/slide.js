var User = function () {
};

User.prompt = function(cb) {
  var user = new User();
  var form = $("<form><input type='text'><input type='submit' value='Send'></form>");
  $('#modal .modal-body').append(form);
  form.submit(function(evt) {
    evt.preventDefault();
    var number = $(this).find('[type=text]').val();
    $.get(Slide.endpoint('/users/' + number + '/public_key'), function(resp) {
      var key = resp.public_key;
      user.number = number;
      user.key = key;
      cb.call(user, number, key);
    });
  });
  $("#modal").modal('toggle');
  return user;
};

User.prototype.requestPrivateKey = function(cb) {
  var actor = new Slide.Actor();
  var self = this;
  actor.openRequest(['private-key'], this.number, this.key, function(fields) {
    cb.call(self, fields['private-key']);
  });
};

export default User;

