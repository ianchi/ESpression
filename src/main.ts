export { jsepParserFactory } from './presets/jsep';
import { es5ParserFactory } from './presets/es5';
export { jsonPathFactory } from './presets/jsonPath';
import { es5EvalFactory } from './eval/es5';
import { jsonPathEvalFactory } from './eval/jsonPathRules';

export { es5ParserFactory, es5EvalFactory, jsonPathEvalFactory };

const parser = es5ParserFactory();
const staticeval = es5EvalFactory();

const jPath = jsonPathEvalFactory();

const obj = {
  'firstName': 'John',
  'lastName': 'doe',
  'age': 26,
  'address': {
    'streetAddress': 'naist street',
    'city': 'Nara',
    'postalCode': '630-0192',
    'array': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  },
  'phoneNumbers': [
    {
      'prop': 'type',
      'type': 'iPhone',
      'number': '0123-4567-8888'
    },
    {
      'prop': 'number',
      'type': 'home',
      'number': '0123-4567-8910'
    }
  ]
};

let ret = jPath.jsonPath(obj, '$.phoneNumbers[1::-1]');
console.log(ret);

// let node = jsonPathFactory().parse('root.member..[1::3,-2:4,(index),?(1>2), *]');
// console.log(node);
