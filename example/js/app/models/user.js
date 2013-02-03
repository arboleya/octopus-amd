
define([], function() {
  var User;
  return User = (function() {
    var _all;

    _all = [];

    function User(first_name, last_name) {
      this.first_name = first_name;
      this.last_name = last_name;
      _all.push(this);
    }

    User.all = function() {
      return _all;
    };

    return User;

  })();
});
