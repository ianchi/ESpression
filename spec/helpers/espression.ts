/** 
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
// import * as es from '../../';

import * as es from '../../src/main';

const parser = new es.ESnextParser(true);
const _eval = new es.ES6StaticEval();
function evaluate(expression: string, context: any) {
  return _eval.evaluate(parser.parse(expression), context);
}
(global as any).espression = { parser, eval: _eval, evaluate };
