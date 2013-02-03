
define(['app/views/user_view', ':jquery'], function(View) {
  var Users;
  return Users = (function() {

    function Users() {}

    Users.prototype.render = function(users) {
      var user, view, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        view = new View(user);
        _results.push(($('body')).append(view.dom));
      }
      return _results;
    };

    return Users;

  })();
});
