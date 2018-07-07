import './parser.interface.ts';

export { StaticEval } from './eval/eval';
export { Parser } from './parser';

export { jsepParserFactory, jsepRules } from './presets/jsep';
export { es5ParserFactory, es5Rules } from './presets/es5';
export { jsonPathParserFactory, es5PathParserFactory } from './presets/jsonPath';
export { es5EvalFactory, ES5StaticEval, unsuportedError } from './eval/es5';
export { jsonPathEvalFactory, jsonPathFactory } from './eval/jsonPathRules';

export { reactiveEvalFactory } from './eval/reactive';

export * from './rules';
