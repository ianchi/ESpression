/*
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { ES6StaticEval, ESnextParser } from '../src/main';
const esNext = new ESnextParser(true);
const ev = new ES6StaticEval();

const context = { o: {} };
const expr = '{[true && "a"]:a, "b":b="test", ...r} ={a:11, b:12, c:20, d:30, e:40} , this';

const node1 = esNext.parse(expr);
console.log('Expr:', expr);
console.log('AST:', node1);

const res = ev.evaluate(node1, context);
console.log('Eval:', res);
