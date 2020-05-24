/** 
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import 'jasmine';
import { createJSEPSpec } from '../helpers/references';

const tests = [
  // octal escapes
  "'Hello\\1World'",
  "'Hello\\02World'",
  "'Hello\\012World'",
  "'Hello\\122World'",
  "'Hello\\0122World'",
  "'Hello\\312World'",
  "'Hello\\412World'",
  "'Hello\\712World'",
  "'Hello\\0World'",
  '012',
  '0012',
  "'\\8'",
  "'\\9'",

  // arrow function expressions non compliant cases
  '(a, b=1, ...c, ) => r',
  '(a, b=1, ...c ) \n=> r',
  '(a, b=1, ...c ) => {r:a}',
];

describe('Non compliant or unsopported in ES5 preset, used in basic preset', () => {
  for (const test of tests) createJSEPSpec(test);
});
