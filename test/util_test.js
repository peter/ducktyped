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

  describe('isNil', function() {
    it('returns true for null and undefined', function() {
      assert(u.isNil(null));
      assert(u.isNil(undefined));
      assert(!u.isNil(0));
      assert(!u.isNil(''));
      assert(!u.isNil(false));
      assert(!u.isNil({}));
      assert(!u.isNil([]));
    });
  });

  describe('empty', function() {
    it('works for strings', function() {
      assert(u.empty(''));
      assert(u.empty('   '));
      assert(!u.empty('foobar'));
    });

    it('works for objects', function() {
      assert(u.empty({}));
      assert(!u.empty({foo: 'bar'}));
    });

    it('works for arrays', function() {
      assert(u.empty([]));
      assert(!u.empty(['foobar']));
    });

    it('returns false for other types', function() {
      [false, true, 0, /foobar/, new Date()].forEach(function(v) {
        assert(!u.empty(v));
      });
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

  describe('compact', function() {
    it('gets not nil items from list', function() {
      assert.equal(u.compact(['a', null, 'a', undefined, 'c', 'b', null]), ['a', 'a', 'c', 'b']);
    });
  });

  describe('uniq', function() {
    it('get unique items from a list', function() {
      assert.equal(u.uniq(['a', 'b', 'a', 'c', 'c', 'b', 'b']), ['a', 'b', 'c']);
    });
  });

  describe('compose', function() {
    it('can compose functions', function() {
      var double = function(v) { return 2*v; },
          pow2 = function(v) { return v*v; };
      assert.equal(u.compose([pow2, double])(5), 100);
      assert.equal(u.compose(pow2, double)(5), 100);
    });
  });

  describe('pipe', function() {
    it('can pipe arguments through functions with value as first arg and retain additional args', function() {
      var _options = {factor: 3},
          foo = function(v, options) { assert.equal(options, _options); return 2*v; },
          bar = function(v, options) { assert.equal(options, _options); return v*v; };
      assert.equal(u.pipe([foo, bar])(5, _options), 100);
      assert.equal(u.pipe(foo, bar)(5, _options), 100);
    });
  });
});
