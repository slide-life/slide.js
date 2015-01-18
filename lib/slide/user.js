var User = {
  prompt: function(cb) {
    var form = $('<form><input type="text"><input type="submit" value="Send"></form>');
    $('#modal .modal-body').append(form);
    form.submit(function(evt) {
      evt.preventDefault();
      var number = $(this).find('[type=text]').val();
      $.get(Slide.endpoint('/users/' + number + '/public_key'), function(resp) {
        var key = resp.public_key;
        cb(number, key);
      });
    });
    $('#modal').modal('toggle');
  }
};

export default User;
