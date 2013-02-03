define(['app/controllers/users', 'app/models/user', ':jquery'], function(Users, User) {
  var App, loading, total;
  App = (function() {

    function App() {
      var users;
      new User('anderson', 'arboleya');
      new User('henrique', 'matias');
      new User('giulian', 'drimba');
      users = new Users;
      users.render(User.all());
    }

    return App;

  })();
  return new App;
});
