/**
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import 'jasmine';
import { createAcornSpec, deepEqual } from '../helpers/references';

const tests = [
  // constants
  ' true',
  'false ',
  'null',
  'this',

  // strings
  "'abc'",
  '"abc"',
  "'ab\\tc'",
  "'ab\nc'",
  "'ab\rc'",
  '\\xFG',
  '\\n\\r\\t\\v\\b\\f\\\\\\\'\\"\\0',
  '\\x61',
  "'Hello\nworld'",
  "'Hello\\\nworld'",
  "'Hello\\\n\rworld'",

  // invalid strings -- should fail
  "'\\x'",
  "'\\x0'",
  "'\\xx'",
  "'\\u'",
  "'\\u0'",
  "'\\ux'",
  "'\\u00'",
  "'\\u000'",
  "'a\\u'",

  // numbers
  '0xFG',
  '0',
  '42',
  '3',
  ' 1.2 ',
  ' .2 ',
  '6.02214179e+23',
  '1.492417830e-10',
  '0x0',
  '0x0;',
  '0e+100 ',
  '0e+100',
  '0xabc',
  '0xdef',
  '0X1A',
  '0x10',
  '0x100',
  '0X04',
  '02',
  '08',
  '0008',
  '09',
  '09.5',
  // invalid numbers - should throw
  '3e',
  '3e+',
  '3e-',
  '3x',
  '3x0',
  '0x',
  '01a',
  '0o1a',
  '0o',
  '0O',
  '0o9',
  '0o18',
  '0o188',
  '0O1a',
  '0b',
  '0b1a',
  '0b9',
  '0b18',
  '0b12',
  '0B',
  '0B1a',
  '0B9',
  '0B18',
  '0B12',
  '0O9',
  '0O18',

  // identifiers
  'abc',
  '$56',
  '@235', // should throw
  '1var', // should throw
  'Δέλτα',

  // array
  '[a]',
  '[]',
  '[ ]',
  '[1, 2, 4]',
  '[ 42 ]',
  '[ 42, ]',
  '[ 1, 2, 3, ]',
  '[', // should throw
  '[,', // should throw

  // members
  'a',
  'a .b',
  'a.b. c',
  'a [b]',
  'a.b  [ c ] ',
  "$foo[ bar][ baz].other12 ['lawl'][12]",
  'a.this',

  // binary expressions
  '1+2',
  'x + y',
  'x - y',
  '"use strict" + 42',
  'x + y + z',
  'x - y + z',
  'x + y - z',
  'x - y - z',
  'x + y * z',
  'x + y / z',
  'x - y % z',
  'x * y * z',
  'x * y / z',
  'x * y % z',
  'x % y * z',
  'x << y << z',
  'x | y | z',
  'x & y & z',
  'x ^ y ^ z',
  'x & y | z',
  'x | y ^ z',
  'x | y & z',
  "'\\n' + bar",

  'x & y',
  'x ^ y',
  'x | y',
  'x || y',
  'x && y',
  'x << y',
  'x >> y',
  'x >>> y',

  'x < y',
  'x > y',
  'x <= y',
  'x >= y',
  'x in y',
  'x instanceof y',
  'x < y < z',
  '3in []', // should throw
  '0x3in[]',
  'x\\',

  '(1) + (2  ) + 3',
  '4 + 5 << (6)',

  '1*2',
  '1*(2+3)',
  '(1+2)*3',
  '(1+2)*3+4-2-5+2/2*3',
  '1 + 2-\t3* \t4 /8',
  '\n1\r\n+\n2\n',

  // invalid

  '(10) => 00',
  '1 + { t:t,',
  'i #= 42',
  '1 + (',

  // logical expressions
  'x || y || z',
  'x && y && z',
  'x || y && z',
  'x || y ^ z',

  ' a || b && c',
  'a || (b&&c)',
  '(a || b) && c',

  // unary operators,

  '!a',
  '-b',
  '~ c',
  '+x',
  '-x',
  'void x',
  'delete x',
  'typeof x',

  '!!a',
  'void void x',
  '- - x',

  // ternary

  'a ? b : c',
  ' a ? b ? c : d : e',
  'a?b:c?d:e',
  'a||b ? c : d',
  'a||b&&f+5*2 ? c : d',
  'y ? 1 : 2',
  'x && y ? 1 : 2',

  // function call
  'func()',
  'func(a,b,c)',
  'func(1+2*3,c)',
  'func(1+2*3,c, )', //  should fail

  // complex

  'a || b && c | d ^ e & f == g < h >>> i + j * k',
  'a + (b < (c * d)) + e',

  '$foo\t\t  [ 12\t ] \t[baz[z]    ].other12*4 + 1 ',
  "$foo[ bar][ baz]    (a, bb ,   c  )   .other12 ['lawl'][12]",
  "(a(b(c[!d]).e).f+'hi'==2) === true",
  '(Object.variable.toLowerCase()).length == 3',
  '(Object.variable.toLowerCase())  .  length == 3',
  '[1] + [2]',

  'obj.(prop)', // should throw
  "obj.'prop'", // should throw
  'obj.1', // should throw

  // compound
  'a b', // should throw on esprima
  'a, b',
  'a;b',
  'a\nb',
  ' \n ',
  '',
  '   ',
  '\t',
  ', ',
  ';\n\n',
  'a;; \n ',
  'a; \n b',
  ';',
  ';a+b',
  ',,3', // should fail
  '1,2,', // should fail
  'func()123',
];
describe('Basic ESnext expressions', () => {
  beforeEach(() => {
    jasmine.addCustomEqualityTester(deepEqual);
  });

  for (const test of tests) createAcornSpec(test);
});
