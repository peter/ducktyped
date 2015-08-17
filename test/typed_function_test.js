'use strict';

var testHelper = require('test/test_helper'),
    assert = testHelper.assert,
    t = require('lib/typed_function'),
    typedFunction = t.typedFunction;

var TYPES = {
  person: {
    structure: {name: 'string', email: 'string', age: 'number?'}
  }
};

var echoArgs = function() {
  return Array.prototype.slice.call(arguments);
};

describe('typed_function', function() {
  describe('typed_function', function() {
    it('works with single argument named parameters (keyword arguments)', function() {
      var options = {types: TYPES};
      var types = {name: 'string', count: 'number', createdBy: 'person', admin: 'person?'};
      var untypedFunction = echoArgs;
      var fn = typedFunction(options, types, untypedFunction);
      var validArgs = {
        name: 'foobar',
        count: 99,
        createdBy: {
          name: 'Joe',
          email: 'joe@example.com'
        }
      };
      var invalidArgs = {
        name: 'foobar',
        count: 99,
        createdBy: {
          name: 'Joe'
        }
      };
      assert.equal(fn(validArgs), [validArgs]);

      assert.throws(function() {
        fn(invalidArgs);
      }, /does not match/);
    });

    it('works with positional arguments', function() {
      var options = {types: TYPES};
      var types = ['string', 'number', 'person', 'person?'];
      var untypedFunction = echoArgs;
      var fn = typedFunction(options, types, untypedFunction);
      var validArgs = [
        'foobar',
        99,
        {
          name: 'Joe',
          email: 'joe@example.com'
        },
        null
      ];
      var invalidArgs = [
        'foobar',
        99,
        {
          name: 'Joe',
          email: 'joe@example.com'
        },
        'foobar'
      ];
      assert.equal(fn.apply(null, validArgs), validArgs);

      assert.throws(function() {
        fn.appy(null, invalidArgs);
      }, /does not match/);
    });
  });

  describe('variadicTypedFunction', function() {
    it('does not require arity of function to match number of arguments passed');
  });
});
