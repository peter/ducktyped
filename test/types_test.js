'use strict';

var testHelper = require('test/test_helper'),
    assert = testHelper.assert,
    types = require('lib/types'),
    typeOf = types.typeOf,
    isType = types.isType,
    internalTypes = types.internalTypes;

describe('types', function() {
  describe('typeOf', function() {
    it('works with null and undefined', function() {
      assert.equal(typeOf(null), 'null');
      assert.equal(typeOf(), 'undefined');
      assert.equal(typeOf(undefined), 'undefined');
    });

    it('works with primitive types', function() {
      assert.equal(typeOf(5), 'number');
      assert.equal(typeOf(6.34), 'number');
      assert.equal(typeOf(true), 'boolean');
      assert.equal(typeOf(false), 'boolean');
      assert.equal(typeOf('foobar'), 'string');
    });

    it('works with arrays, plain objects, and functions', function() {
      assert.equal(typeOf({}), 'object');
      assert.equal(typeOf({foo: 1}), 'object');
      assert.equal(typeOf([]), 'array');
      assert.equal(typeOf(function() {}), 'function');
    });

    it('works with RegExp and Date', function() {
      assert.equal(typeOf(new Date()), 'date');
      assert.equal(typeOf(/foobar/), 'regexp');
    });
  });

  describe('isType', function() {
    it('works with basic types', function() {
      assert(isType({type: 'null', value: null}));
      assert(!isType({type: 'null', value: 'foobar'}));

      assert(isType({type: 'undefined', value: undefined}));
      assert(!isType({type: 'undefined', value: 'foobar'}));

      assert(isType({type: 'string', value: 'foobar'}));
      assert(!isType({type: 'string', value: 5}));

      assert(isType({type: 'number', value: 5}));
      assert(!isType({type: 'number', value: 'foobar'}));

      assert(isType({type: 'boolean', value: true}));
      assert(isType({type: 'boolean', value: false}));
      assert(!isType({type: 'boolean', value: 'foobar'}));

      assert(isType({type: 'object', value: {value: 5}}));
      assert(!isType({type: 'object', value: 'foobar'}));

      assert(isType({type: 'array', value: [5]}));
      assert(!isType({type: 'array', value: 'foobar'}));

      assert(isType({type: 'function', value: function() {}}));
      assert(!isType({type: 'function', value: 'foobar'}));

      assert(isType({type: 'date', value: new Date()}));
      assert(!isType({type: 'date', value: 'foobar'}));

      assert(isType({type: 'regexp', value: /foobar/}));
      assert(!isType({type: 'regexp', value: 'foobar'}));
    });

    it('works with internal types', function() {
      assert(isType({types: internalTypes, type: 'typeName', value: 'number'}));
      assert(isType({types: internalTypes, type: 'typeName', value: 'typeName'}));
      assert(!isType({types: internalTypes, type: 'typeName', value: 'foooobar'}));
    });
  });
});
