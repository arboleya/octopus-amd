
/*
 * Octopus Micro AMD Loader - v0.1.0
 *
*/

var Chunk, OctopusAMD, Script, define, require,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Script = (function() {
  var cached, started;

  started = {};

  cached = {};

  Script.prototype.id = null;

  Script.prototype.el = null;

  Script.prototype.url = null;

  Script.prototype.done = null;

  Script.prototype.error = null;

  function Script(id, url, done, error, timeout, is_non_amd) {
    var _this = this;
    this.id = id;
    this.url = url;
    this.done = done;
    this.error = error;
    this.is_non_amd = is_non_amd;
    setTimeout(function() {
      return _this.load();
    }, timeout);
  }

  Script.prototype.load = function() {
    var head, reg,
      _this = this;
    if (OctopusAMD.MAP[this.id] != null) {
      this.url = OctopusAMD.MAP[this.id];
    } else {
      this.url = this.id;
    }
    if (!/^http/m.test(this.url)) {
      reg = new RegExp("(^" + (OctopusAMD.BASE_URL.replace('/', '\\/')) + ")");
      if (!reg.test(this.url)) {
        this.url = "" + OctopusAMD.BASE_URL + this.url;
      }
    }
    if ((this.url.indexOf('.js')) < 0) {
      this.url += '.js';
    }
    if (cached[this.url] === true) {
      return this.done(this.id, this.url);
    } else if (started[this.url] != null) {
      return;
    }
    this.el = document.createElement('script');
    this.el.type = 'text/javascript';
    this.el.charset = 'utf-8';
    this.el.async = true;
    this.el.setAttribute('data-id', this.id);
    this.el.src = this.url;
    this.el.onerror = this.error;
    if (this.el.readyState) {
      this.el.onreadystatechange = function(ev) {
        if (_this.el.readyState === 'loaded' || _this.el.readyState === 'complete') {
          _this.el.onreadystatechange = null;
          return _this.internal_done(ev);
        }
      };
    } else {
      this.el.onload = function(ev) {
        return _this.internal_done(ev);
      };
    }
    started[this.url] = true;
    head = (document.getElementsByTagName('head'))[0];
    return head.insertBefore(this.el, head.lastChild);
  };

  Script.prototype.internal_done = function(ev) {
    cached[this.url] = true;
    return this.done(this.id, this.el.src, this.is_non_amd);
  };

  return Script;

})();

Chunk = (function() {

  Chunk.chunks = {};

  Chunk.chunks_list = [];

  Chunk.prototype.type = null;

  Chunk.prototype.id = null;

  Chunk.prototype.deps = null;

  Chunk.prototype.factory = null;

  Chunk.prototype.non_amd = null;

  Chunk.prototype.factored = null;

  function Chunk(type, id, deps, factory, non_amd) {
    this.type = type;
    this.id = id;
    this.deps = deps;
    this.factory = factory;
    this.non_amd = non_amd != null ? non_amd : false;
    if ((this.id != null) && this.id[0] === ':') {
      this.id = this.id.substr(1);
    }
    Chunk.chunks_list.unshift(this);
  }

  Chunk.notify_all = function(loaded) {
    var chunk, _i, _len, _ref, _results;
    _ref = this.chunks_list;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chunk = _ref[_i];
      _results.push(chunk.exec(loaded));
    }
    return _results;
  };

  Chunk.reorder = function(cycling) {
    var chunk, chunk_index, cl, dep, dep_chunk, dep_chunk_index, dep_index, msg, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    if (cycling == null) {
      cycling = false;
    }
    _ref = this.chunks_list;
    for (chunk_index = _i = 0, _len = _ref.length; _i < _len; chunk_index = ++_i) {
      chunk = _ref[chunk_index];
      if (!chunk.deps.length) {
        continue;
      }
      _ref1 = chunk.deps;
      for (dep_index = _j = 0, _len1 = _ref1.length; _j < _len1; dep_index = ++_j) {
        dep = _ref1[dep_index];
        if (dep[0] === ':') {
          continue;
        }
        dep_chunk_index = this._get_index_by_id(dep);
        if ((dep_chunk_index != null) && dep_chunk_index < chunk_index) {
          continue;
        }
        dep_chunk = this.chunks_list[dep_chunk_index];
        if (dep_chunk != null) {
          if (dep_chunk.deps.length && (_ref2 = chunk.id, __indexOf.call(dep_chunk.deps, _ref2) >= 0)) {
            chunk.deps.splice(dep_index, 1);
            msg = "Circular dependency found between '" + chunk.id + "' and ";
            msg += "'" + dep_chunk.id + "'";
            console.error(msg);
            continue;
          } else {
            cl = this.chunks_list;
            cl.splice(chunk_index, 0, (cl.splice(dep_chunk_index, 1))[0]);
            return this.reorder(true);
          }
        }
      }
    }
  };

  Chunk._get_index_by_id = function(id) {
    var chunk, index, _i, _len, _ref;
    _ref = this.chunks_list;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      chunk = _ref[index];
      if (chunk.id === id) {
        return index;
      }
    }
    return null;
  };

  Chunk.prototype.exec = function(loaded) {
    var current, dep, mod, refs, _i, _len, _ref;
    if (this.factored != null) {
      return this.factored;
    }
    if (!this._is_subtree_loaded()) {
      return;
    }
    if (this.factory == null) {
      return;
    }
    refs = [];
    _ref = this.deps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dep = _ref[_i];
      if (dep[0] === ':') {
        continue;
      }
      current = Chunk.chunks[dep];
      mod = current.exec(loaded);
      if (mod != null) {
        refs.push(mod);
      }
    }
    if (this.factory instanceof Function) {
      if (this.type === 'require') {
        this.execd = true;
      }
      this.factored = this.factory.apply(null, refs);
    } else if (typeof this.factory === 'object') {
      this.factored = this.factory;
    }
    return this.factored;
  };

  Chunk.prototype._is_subtree_loaded = function() {
    var dep, status, _i, _len, _ref;
    status = true;
    _ref = this.deps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dep = _ref[_i];
      if (dep[0] === ':') {
        dep = dep.substr(1);
      }
      if (Chunk.chunks[dep] != null) {
        dep = Chunk.chunks[dep];
        if (dep.factored === null && dep.non_amd === false) {
          return false;
        }
      } else {
        return false;
      }
    }
    return status;
  };

  return Chunk;

})();

require = function() {
  return OctopusAMD.process('require', [].slice.call(arguments));
};

define = function() {
  return OctopusAMD.process('define', [].slice.call(arguments));
};

OctopusAMD = (function() {

  function OctopusAMD() {}

  OctopusAMD.last_chunk = null;

  OctopusAMD.BASE_URL = null;

  OctopusAMD.MAP = {};

  OctopusAMD.config = function(options) {
    this.BASE_URL = options.base_url || '';
    return this.MAP = options.paths || {};
  };

  OctopusAMD.process = function(type, params) {
    var chunk, dep, dep_id, dep_url, is_non_amd, timeout, _i, _len, _ref, _ref1, _results;
    if ((this.last_chunk != null) && this.last_chunk.type === 'require') {
      this.define_chunk('root');
    }
    params = this._name_params(type, params);
    chunk = new Chunk(type, params.id, params.deps, params.factory);
    if (type === 'define' && (chunk.id != null)) {
      Chunk.chunks[chunk.id] = chunk;
    } else {
      this.last_chunk = chunk;
    }
    timeout = 0;
    _ref = params.deps;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dep = _ref[_i];
      _ref1 = this.disassemble(dep), dep_id = _ref1[0], dep_url = _ref1[1], is_non_amd = _ref1[2];
      if (Chunk.chunks[dep_id] != null) {
        continue;
      }
      _results.push(new Script(dep_id, dep_url, function(id, url, is_non_amd) {
        OctopusAMD.define_chunk(id, url, is_non_amd);
        Chunk.reorder();
        return Chunk.notify_all(id);
      }, function(e) {
        return console.error(e);
      }, (timeout += 1), is_non_amd));
    }
    return _results;
  };

  OctopusAMD.disassemble = function(id) {
    var absolute, is_non_amd, url;
    is_non_amd = false;
    if (id[0] === ':') {
      is_non_amd = true;
      id = id.substr(1);
    }
    if (this.MAP[id] != null) {
      url = this.MAP[id];
    } else {
      url = id;
    }
    if (!(/^http/m.test(url))) {
      absolute = new RegExp("(^" + (this.BASE_URL.replace('/', '\\/')) + ")");
      if (!(absolute.test(url))) {
        url = "" + this.BASE_URL + url;
      }
    }
    if ((url.indexOf('.js')) < 0) {
      url += '.js';
    }
    return [id, url, is_non_amd];
  };

  OctopusAMD.define_chunk = function(id, url, is_non_amd) {
    if (this.last_chunk === null && is_non_amd) {
      return Chunk.chunks[id] = new Chunk('require', id, [], null, true);
    } else if (this.last_chunk != null) {
      this.last_chunk.id = this.last_chunk.id || id;
      if (this.last_chunk.id[0] === ':') {
        this.last_chunk.id = this.last_chunk.id.substr(1);
      }
      Chunk.chunks[this.last_chunk.id] = this.last_chunk;
      return this.last_chunk = null;
    }
  };

  OctopusAMD._name_params = function(type, params) {
    var sorted;
    sorted = {
      id: null,
      deps: null,
      factory: null
    };
    switch (type) {
      case 'require':
        sorted.deps = params[0];
        sorted.factory = params[1] || null;
        break;
      case 'define':
        sorted.factory = params[params.length - 1];
        if (params.length === 3) {
          sorted.id = params[0];
          sorted.deps = [].concat(params[1]);
        } else if (params.length === 2) {
          sorted.deps = [].concat(params[0]);
        } else if (params.length = 1) {
          sorted.deps = [];
        }
    }
    return sorted;
  };

  return OctopusAMD;

})();
