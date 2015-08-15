'use strict';

var u = require('./util'),
    TypeName = require('./type_name');

var parse = function(typeSpec, options) {
  options = options || {};
  if (options.validate === undefined) options.validate = true;
  if (u.typeOf(typeSpec) !== 'string') return null;
  var result = {},
      validTypeName = TypeName.validate.bind(null, options.types);
  if (typeSpec.indexOf('?') === (typeSpec.length-1)) {
    result.optional = true;
    typeSpec = typeSpec.substring(0, typeSpec.length-1);
  }
  if (u.contains('|', typeSpec)) {
    result.typeNames = typeSpec.split('|');
    result.operator = 'any';
  } else if (u.contains('&', typeSpec)) {
    result.typeNames = typeSpec.split('&');
    result.operator = 'all';
  } else {
    result.typeNames = [typeSpec];
  }
  if (options.validate && !u.all(result.typeNames, validTypeName)) return null;
  return result;
};

var containsType = function(typeSpec, typeName) {
  var parsed = parse(typeSpec, {validate: false});
  return parsed && u.contains(typeName, parsed.typeNames);
};

module.exports = {
  parse: parse,
  containsType: containsType
};
