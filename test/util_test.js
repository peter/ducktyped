'use strict';

var testHelper = require('test/test_helper'),
    assert = testHelper.assert,
    u = require('lib/util'),
    typeOf = u.typeOf,
    uniq = u.uniq,
    merge = u.merge;

describe('util', function() {
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

  describe('uniq', function() {
    it('works with different data types in an array', function() {
      assert.equal(uniq([5, '5', 5, '5', 'foo']), [5, '5', 'foo']);
    });
  });

  describe('merge', function() {
    it('does a shallow and non mutating merge from one object into another', function() {
      var to = {
        foo: 'bar',
        bar: 1
      };
      var from = {
        foo: 'baaar',
        baz: 2
      };
      var expect = {
        foo: 'baaar',
        bar: 1,
        baz: 2
      };
      assert.equal(merge(to, from), expect);
      assert.equal(to, {foo: 'bar', bar: 1}, "to object should not be mutated");
    });
  });
});
