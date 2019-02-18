/*
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BasicParser, ES6Parser, ES6StaticEval } from '../src/main';
const es5 = new ES6Parser(true);
const jsep = new BasicParser();

const node1 = es5.parse('(a, b=(console.log(a), a*2), ...c, ) => (console.log(c),a+b)');
const node2 = jsep.parse('A+B');
console.log(node1);
console.log(node2);

const ev = new ES6StaticEval();

const func = ev.evaluate(node1, { console });

console.log(func(10, 12, 1, 2, 3, 4));
console.log(func(10));
