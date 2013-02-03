
define([':vendor_a', ':vendor_b'], function() {
  var List;
  return List = (function() {

    function List(data) {
      var key, val;
      this.buffer = ['<hr/><b>New User</b>:'];
      for (key in data) {
        val = data[key];
        this.buffer.push("" + key + " -> " + val);
      }
    }

    List.prototype.compile = function() {
      return this.buffer.join('<br/>');
    };

    return List;

  })();
});