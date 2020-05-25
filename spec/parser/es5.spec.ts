/**
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable no-template-curly-in-string */

import 'jasmine';
import { createAcornSpec, deepEqual } from '../helpers/references';

const tests = [
  '[,,]',
  '[ ,, 42 ]',
  '[a,]',
  '[ 1, 2,, 3, ]',
  ' [a , b, ...c, ...d,]',
  "'abc'.length",
  '() + 42',
  '() <= 42',
  'func(,,param)', // should throw

  '/test/',
  '/teste/i',
  '/test/i',
  '/test[/]/',
  '/test',
  '234/test',
  '234/test/ig',

  'typeof {}',
  'typeof { }',
  'typeof {prop: value}',
  'typeof {prop:value,}',
  "typeof {prop1: value1, \n 'prop2': a+b, 3:z ? x : y}",
  'typeof {prop: value,', // should fail

  'x = 42',
  'eval = 42',
  'arguments = 42',
  'x *= 42',
  'x /= 42',
  'x %= 42',
  'x += 42',
  'x -= 42',
  'x <<= 42',
  'x >>= 42',
  'x >>>= 42',
  'x &= 42',
  'x ^= 42',
  'x |= 42',
  'a = b = x',
  'a += c += d',

  'a ? b=c : d=e',

  '3 = 4', // should fail
  'func() = 4',
  '(1 + 1) = 10',
  'i + 2 = 42',
  '+i = 42',
  'p = { "q"/ }',

  'x++',
  'x--',
  '++x',
  '--x',
  'a\n++b',

  '1++', // should fail
  '1--',
  '++1',
  '--1',
  '++a++',
  '++ ++ a',
  'a++ --',
  'a\n++',
  '- - ++x',
  '- - x++',

  // new
  'new Date',
  'new Date()',
  'new Date(Date.now())',
  'new (a+b)(c)',
  'new a.b(c)',
  'new a + b',
  'new a ? b : c',
  'new',

  // template literals
  '``',
  '`string`',
  '`string ${expr}`',
  '`string ${a+b} string2`',
  '`${func(d)}`',
  '`${3,4,5}string`',
  '`string ${++expr1}${expr2} string ${expr3}`',
  '`string ${a;b;c}`', // should fail
  '`line1\nline2`',
  '`line1\\nline2`',
  '`line1\\\nline1cont`',
  '`text\\${expr}`',

  // tagged template expression

  'tag`string`',
  'tag``',
  'tag`string ${expr}`',
  'tag.member`string`',
  'tag().member`string`',
  'call()`string`',

  // Object literals

  'a = {a:1}',
  "a = {a: 1+2, '.b': 'text', c: 25 }",
  'a = {}',
  'a = {  }',
  'a = { b:1, c:2,}',
  'a = { [b()]:c, d, e,}',
  'r = {a, [c]:123, d:4567}',
  'r = {a, [c]:123, [d]}', // should fail
  'r = {a, [c], d}', // should fail

  // inconsistent behavior in jsep
  ' ; ',
  ';\n\n;\n',

  // Arrow Functions

  'a => r',
  '( ) => r',
  '(a, b) => r',
  '(a, b, ) => r',
  '(a, b=1, ...c) => r',
  '(a, b) => a || b && c | d ^ e & f == g < h >>> i + j * k',
  'd = (a, b) => r',

  '([a,b]) => r',
  '([a.x, b]) => r', // should fail
  '(a, [b, c], ...z) => r',
  '(a, [b, c]=[1,2], ...z) => r',
  '( ...r, a) => r', // should fail
  '([a,b, ...r], {x, y, ...z}, ...o) => r',
  '({a: x, b: y} = {}) => r',
  '({a: x.x, b: x.y} = {}) => r', // should fail
  '({a: x = 1, b: y=2, [prop]: z} = {}) => r',

  // should fail
  '(a, b=1, ...c, k) => r',
  '(a, , ...c) => r',
  '(a, b=1, ...c=1 ) => r',
  'w + (a, b) => r',

  // de-structuring assignment
  '[a, b] = c',
  '[a, b, ] = c',
  '[a, ,b=2] = c',
  '[[a, b], c] = d',
  '[a, b] = [c, d] = e',
  '[a, , ...r] = c',
  '[...a, , b] = c', // should fail
  '[a.b, c] = d',
  '[a.b=2*5, c] = d',
  '[a, {b, c}] = d',
  '[a, {b, c} = f ] = d',
  '[a.x , a.y, c, , ...d ] = c',
  'a = [b, c] = d',
  '[a, b] *= [0, 0]', // should fail

  '({a, b} = c)',
  '({a, b=2} = c)',
  '({a, b:alias } = c)',
  '({a, [b]:alias } = c)',
  '({a, [b] } = c)', // should fail
  '({a, 1:alias, "text": alias2 = 123 } = c)',
  '({a, ...b } = c)',
  '({a, , ...b } = c)', // should fail
  '({a, ...b, c } = c)', // should fail
  '({a, b, } = c)',
  '({a, b: o.x, d: o.y = 12 } = c)',
  '({a, b:[d,e] } = c)',
  '({a, b:[d,e] = [1,2] } = c)',
  '({a, b:{d,e} } = c)',
  '({a, b:{d,e} = {} } = c)',

  // should fail
  '[a, b] += 12',
  '( {a, ..b} /= 23 )',

  // non compliant in ESpression, they are allowed and shouldn't
  // '(a, b=1, ...c, ) => r',
  // '(a, b=1, ...c ) \n=> r',
  // '(a, b=1, ...c ) => {r:a}',
  // '[a, , ...r,] = c',
  // '({a, ...b, } = c)',
];
describe('Not suported in JSEP expressions', () => {
  beforeEach(() => {
    jasmine.addCustomEqualityTester(deepEqual);
  });

  for (const test of tests) createAcornSpec(test);
});
