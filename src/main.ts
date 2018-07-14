/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import './parser.interface.ts';

export { StaticEval } from './eval/eval';
export { Parser } from './parser';

export { jsepParserFactory, jsepRules } from './presets/jsep';
export { es5ParserFactory, es5Rules } from './presets/es5';
export { jsonPathParserFactory, es5PathParserFactory } from './presets/jsonPath';
export { es5EvalFactory, ES5StaticEval, unsuportedError } from './eval/es5';
export { jsonPathEvalFactory, jsonPathFactory } from './eval/jsonPathRules';

export { reactiveEvalFactory, ReactiveEval } from './eval/reactive';
export * from './eval/combineMixed';

export * from './rules';

export * from './parser.interface';

export {
  IDENTIFIER_EXP, LITERAL_EXP, MEMBER_EXP, BINARY_EXP, ASSIGN_EXP, UPDATE_EXP, UNARY_EXP
} from './presets/es5conf';

export * from './eval/rxobject';
