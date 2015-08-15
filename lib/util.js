'use strict';

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
  for(var key in object) {
    result.push(object[key]);
  }
  return result;
};

module.exports = {
  contains: contains,
  all: all,
  any: any,
  objectValues: objectValues
};
