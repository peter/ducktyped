'use strict';

var testHelper = require('test/test_helper'),
    assert = testHelper.assert,
    t = require('lib/transform');

describe('transform', function() {
  describe('setDefaultValue', function() {
    it('returns defaultValue if defined and if value is nil, otherwise value (curried)', function() {
      var assertions = [
        [[undefined, 5], 5],
        [[undefined, null], null],
        [[undefined, undefined], undefined],
        [[undefined, 0], 0],
        [[null, undefined], null],
        [[null, 5], 5],
        [[9, 5], 5],
        [[9, null], 9],
        [[9, undefined], 9]
      ];
      assertions.forEach(function(a) {
        var args = a[0],
            expect = a[1];
        assert.equal(t.setDefaultValue.apply(null, args), expect);
        assert.equal(t.setDefaultValue(args[0])(args[1]), expect);
      });
    });
  });

  describe('typeConvert', function() {
    it('can convert string to number (curried)', function() {
      // function(baseType, typeDef, value)
      var assertions = [
        [['number', {type: 'string'}, '5'], 5],
        [['number', {type: 'string'}, '9.4'], 9.4]
      ];

      assertions.forEach(function(a) {
        var args = a[0],
            expect = a[1];
        assert.equal(t.typeConvert.apply(null, args), expect);
        assert.equal(t.typeConvert.apply(null, args.slice(0, 2))(args[2]), expect);
      });
    });
  });

  describe('defaultBaseTransform', function() {
    it('nullifies if empty, does type conversion, and sets default value', function() {
      // var defaultBaseTransform = function(value, options) {
      // argsType: ['any', {types: 'typeDefs?', type: 'typeDef'}]
      var types = {
        interest: {
          type: 'number',
          default: 1.03
        }
      };

      var assertions = [
        [['2.5', {types: types, type: 'interest'}], 2.5],
        [[null, {types: types, type: 'interest'}], types.interest.default],
        [['', {types: types, type: 'interest'}], types.interest.default]
      ];
      assertions.forEach(function(a) {
        var args = a[0],
            expect = a[1];
        assert.equal(t.defaultBaseTransform.apply(null, args), expect, "args: " + JSON.stringify(args));
      });
    });
  });

  describe('transformType', function() {
    it('does nothing if a custom type cannot be found', function() {
      assert.equal(t.transformType({typeSpec: 'number|string', value: true}), true);
      assert.equal(t.transformType({typeSpec: 'number', value: 'foobar'}), 'foobar');
      assert.equal(t.transformType({typeSpec: 'foobar', value: 'foo'}), 'foo');
    });

    it('does the default base transform if nothing else is configured', function() {
      var types = {
        interest: {
          type: 'number',
          default: 1.03
        }
      };

      assert.equal(t.transformType({types: types, typeSpec: 'interest', value: ''}), 1.03);
      assert.equal(t.transformType({types: types, typeSpec: 'interest', value: '5.0'}), 5.0);
    });

    it('it can use a custom transform for a type in addition to the base transform');

    it('it can use a custom base transform');
  });

  describe('transformStructure', function() {
    it('can apply transformType to all values in a type structure (nested object/array)', function() {
      // argsType: {baseTransform: 'function?', types: 'typeDefs?', structure: 'typeStructure', value: 'any'}
      var types = {
        interest: {
          type: 'number',
          default: 1.03
        }
      };
      var structure = {
        foo: {
          bar: ['interest'],
          baz: 'interest',
          bla: 'number'
        }
      };
      var value = {
        foo: {
          bar: [null, 5.0, '3.2']
        },
        bar: 'hello' // ignored
      };
      var expect = {
        foo: {
          bar: [1.03, 5.0, 3.2],
          baz: 1.03,
          bla: undefined
        }
      };
      var actual = t.transformStructure({types: types, structure: structure, value: value});
      assert.equal(actual, expect);
    });
  });
});
