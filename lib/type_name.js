'use strict';

var u = require('./util');

var basicTypes = ['null', 'undefined', 'string', 'number', 'boolean', 'object', 'array', 'function', 'date', 'regexp'];

var validate = function(types, typeName) {
  return u.contains(typeName, basicTypes) || u.contains(typeName, Object.keys(types || {}));
};

module.exports = {
  basicTypes: basicTypes,
  validate: validate
};
