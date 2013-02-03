
define(['app/views/ui/list'], function(List) {
  var UserView;
  return UserView = (function() {

    function UserView(user) {
      this.dom = (new List(user)).compile();
    }

    return UserView;

  })();
});
