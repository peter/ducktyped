'use strict';

var toString = Object.prototype.toString;

var contains = function(v, container) {
  return container.indexOf(v) > -1;
};

var all = function(container, test) {
  for (var i = 0; i < container.length; ++i) {
    if (!test(container[i])) return false;
  }
  return true;
};

var any = function(container, test) {
  for (var i = 0; i < container.length; ++i) {
    if (test(container[i])) return true;
  }
  return false;
};

var objectValues = function(object) {
  var result = [];
  for (var key in object) {
    result.push(object[key]);
  }
  return result;
};

var typeOf = function(value) {
  var type = typeof value;
  if (type === 'object') {
    if (value === null) {
      type = 'null';
    } else if (value === undefined) {
      type = 'undefined';
    } else if ((typeof value.length === 'number') && toString.call(value) === '[object Array]') {
      type = 'array';
    } else if (toString.call(value) === '[object Date]') {
      type = 'date';
    } else if (toString.call(value) === '[object RegExp]') {
      type = 'regexp';
    }
  }
  return type;
};

var isNil = function(value) {
  return typeOf(value) === 'undefined' || typeOf(value) === 'null';
};

var empty = function(value) {
  if (typeOf(value) === 'object') {
    return Object.keys(value).length === 0;
  } else if (typeOf(value) === 'array') {
    return value.length === 0;
  } else if (typeOf(value) === 'string') {
    return value.trim().length === 0;
  } else {
    return false;
  }
};

var nullifyEmpty = function(value) {
  return empty(value) ? null : value;
};

var uniq = function(items) {
  return items.filter(function(item, index) {
    return items.indexOf(item) === index;
  });
};

var merge = function(to, from) {
  var result = {};
  uniq(Object.keys(to).concat(Object.keys(from))).forEach(function(key) {
    result[key] = contains(key, Object.keys(from)) ? from[key] : to[key];
  });
  return result;
};

var identity = function(value) {
  return value;
};

var not = function(fn) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    return !fn.apply(null, args);
  };
};

var compact = function(items) {
  return items.filter(not(isNil));
};

var compose = function() {
  var args = Array.prototype.slice.call(arguments);
  var fns = (typeOf(args[0]) === 'array' ? args[0] : args);
  return function(value) {
    var result = value;
    for (var i = fns.length - 1; i >= 0; --i) {
      result = fns[i](result);
    }
    return result;
  };
};

// Inspired by the Clojure thread first macro and the Elixir pipe operator
var pipe = function() {
  var _args = Array.prototype.slice.call(arguments);
  var fns = (typeOf(_args[0]) === 'array' ? _args[0] : _args);
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var result = null;
    for (var i = 0; i < fns.length; ++i) {
      result = fns[i].apply(null, args);
      args = [result].concat(args.slice(1));
    }
    return result;
  };
};

var _curry = function(_args, fn) {
  return function() {
    var args = _args.concat(Array.prototype.slice.call(arguments));
    if (args.length === fn.length) {
      return fn.apply(null, args);
    } else {
      return _curry(args, fn);
    }
  };
};

var curry = function(fn) {
  return _curry([], fn);
};

var isStructure = function(value) {
  return typeOf(value) === 'object' || typeOf(value) === 'array';
};

var getPath = function(path, value) {
  var result = value;
  for (var i = 0; i < path.length; ++i) {
    result = result[path[i]];
    if (!isStructure(result)) return result;
  }
  return result;
};

module.exports = {
  contains: contains,
  all: all,
  any: any,
  objectValues: objectValues,
  typeOf: typeOf,
  isNil: isNil,
  empty: empty,
  nullifyEmpty: nullifyEmpty,
  merge: merge,
  identity: identity,
  uniq: uniq,
  not: not,
  compact: compact,
  compose: compose,
  pipe: pipe,
  curry: curry,
  getPath: getPath
};
