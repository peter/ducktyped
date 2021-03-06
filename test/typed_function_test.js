'use strict';

var testHelper = require('test/test_helper'),
    assert = testHelper.assert,
    t = require('lib/typed_function'),
    typedFunction = t.typedFunction;

var TYPES = {
  person: {
    structure: {name: 'string', email: 'string', age: 'number?'}
  },
  recipe: {
    type: 'object',
    structure: {
      name: 'string',
      popularity: 'number?',
      ingredients: ['string']
    }
  },
  recipeOptions: {
    type: 'object',
    structure: {
      force: 'boolean?'
    },
    allowMore: false
  }
};

var echoArgs = function() {
  return Array.prototype.slice.call(arguments);
};

describe('typed_function', function() {
  describe('typed_function', function() {
    it('works with single argument named parameters (keyword arguments)', function() {
      var options = {types: TYPES};
      var argsType = [{name: 'string', count: 'number', createdBy: 'person', admin: 'person?'}];
      var untypedFunction = echoArgs;
      var fn = typedFunction(options, argsType, untypedFunction);
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
      }, /do not match/);
    });

    it('works with positional arguments', function() {
      var options = {types: TYPES};
      var argsType = ['string', 'number', 'person', 'person?'];
      var untypedFunction = echoArgs;
      var fn = typedFunction(options, argsType, untypedFunction);
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
      }, /do not match/);
    });

    it('works with an options parameter', function() {
      var options = {types: TYPES};
      var untypedFunction = echoArgs;
      var fn = typedFunction(options, ['recipe', 'recipeOptions?'], untypedFunction);
      var recipe = {name: 'Pancakes', ingredients: ['milk', 'eggs', 'flour']};

      // VALID INVOCATIONS:
      assert.equal(fn(recipe), [recipe]);
      assert.equal(fn(recipe, {force: true}), [recipe, {force: true}]);

      // INVALID INVOCATIONS
      assert.throws(function() {
        fn('Pancakes');
      }, /do not match/);
      assert.throws(function() {
        fn(recipe, {foobar: true});
      }, /do not match/);
      assert.throws(function() {
        fn(recipe, {force: 'yes'});
      }, /do not match/);
    });

    it('works with type objects (typeDef) instead of array', function() {
      var options = {types: TYPES};
      var untypedFunction = echoArgs;
      var fn = typedFunction(options, {type: 'array', valueType: 'recipe', allowEmpty: false}, untypedFunction);
      var recipe = {name: 'Pancakes', ingredients: ['milk', 'eggs', 'flour']};

      // VALID INVOCATIONS:
      assert.equal(fn(recipe, recipe), [recipe, recipe]);

      // INVALID INVOCATIONS
      assert.throws(function() {
        fn();
      }, /do not match/);
      assert.throws(function() {
        fn(recipe, 'Pancakes');
      }, /do not match/);
    });

    it('works with variadic functions', function() {
      var options = {types: TYPES, variadic: true};
      var untypedFunction = echoArgs;
      var fn = typedFunction(options, ['recipe'], untypedFunction);
      var recipe = {name: 'Pancakes', ingredients: ['milk', 'eggs', 'flour']};

      // VALID INVOCATIONS:
      assert.equal(fn(recipe), [recipe]);
      assert.equal(fn(recipe, 'foobar'), [recipe, 'foobar']);
      assert.equal(fn(recipe, 'foobar', true), [recipe, 'foobar', true]);

      // INVALID INVOCATIONS
      assert.throws(function() {
        fn('Pancakes');
      }, /do not match/);
    });

    it('can optionally invoke transform on argument values', function() {
      var types = {
        interest: {
          type: 'number',
          default: 1.03
        }
      };
      var options = {types: types, transform: true};
      var untypedFunction = echoArgs;
      var fn = typedFunction(options, ['interest', 'interest', 'interest'], untypedFunction);

      assert.equal(fn(null, 3.2, '5.0'), [1.03, 3.2, 5.0]);
    });
  });
});
