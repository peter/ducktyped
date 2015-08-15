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

module.exports = {
  contains: contains,
  all: all,
  any: any,
  objectValues: objectValues,
  typeOf: typeOf,
  isNil: isNil
};
