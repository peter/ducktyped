'use strict';

var u = require('./util'),
    types = require('./types'),
    isType = types.isType;

var typedFunction = u.curry(function(options, argsStructure, fn) {
  // argTypes: [{types: 'types?'}, 'typeStructure', 'function']
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var type = {structure: argsStructure, allowMore: (options.variadic ? true : false)};
    if (!isType({types: options.types, type: type, value: args})) {
      throw new Error("Arguments " + JSON.stringify(args) + " does not match type structure " + JSON.stringify(argsStructure));
    }
    return fn.apply(null, args);
  };
});

var variadicTypedFunction = u.curry(function(options, types, fn) {
  return typedFunction(u.merge(options, {variadic: true}), types, fn);
});

module.exports = {
  typedFunction: typedFunction,
  variadicTypedFunction: variadicTypedFunction
};
