/*
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BasicParser, ES5Parser } from '../src/main';
const es5 = new ES5Parser(true);
const jsep = new BasicParser();

const node1 = es5.parse('!a');
const node2 = jsep.parse('func(a,b)');
console.log(node1);
console.log(node2);
