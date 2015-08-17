'use strict';

var u = require('./util'),
    types = require('./types'),
    isStructure = types.isStructure;

var typedFunction = u.curry(function(options, types, fn) {
  options = options || {};
  return function() {
    var args = Array.prototype.slice.call(arguments);
    if (u.typeOf(types) === 'object') {
      if (args.length !== 1) {
        throw new Error("Expected to be called with one argument with named parameters");
      }
      if (!isStructure({types: options.types, structure: types, value: args[0]})) {
        throw new Error("Argument " + JSON.stringify(args[0]) + " does not match type structure " + JSON.stringify(types));
      }
    } else if (u.typeOf(types) === 'array') {
      if (args.length !== types.length) {
        throw new Error("Expected to be called with " + types.length + " arguments but got " + args.length + ": " + JSON.sringify(args));
      }
      if (!isStructure({types: options.types, structure: types, value: args})) {
        throw new Error("Argument " + JSON.stringify(args[0]) + " does not match type structure " + JSON.stringify(types));
      }
    } else {
      throw new Error("The types argument must be an object or an array");
    }
    fn.apply(null, args);
  };
});

var variadicTypedFunction = u.curry(function(options, types, fn) {
  options = options || {};
  // TODO: allow additional arguments
});

var configure = function(options) {
  return {
    typedFunction: typedFunction(options),
    variadicTypedFunction: variadicTypedFunction(options)
  };
};

module.exports = {
  typedFunction: typedFunction,
  variadicTypedFunction: variadicTypedFunction,
  configure: configure
};