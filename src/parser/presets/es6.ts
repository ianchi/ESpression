/*!
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Parser } from '..';
import { ICharClass, INode } from '../parser.interface';
import { IRuleSet, ParserContext } from '../parserContext';
import { BinaryOperatorRule, StringRule, TryBranchRule, UnaryOperatorRule } from '../rules';

import {
  ARRAY_PAT,
  ARROW_EXP,
  ASSIGN_PAT,
  ASSIGN_TYPE,
  checkRest,
  EXPRESSION,
  IDENTIFIER_EXP,
  NOCOMMA_EXPR,
  OBJECT_PAT,
  PARAMS_TYPE,
  PROPERTY,
  PROPERTY_TYPE,
  REST_ELE,
  STATEMENT,
} from './const';
import { es5Rules, memberRule, numberRules } from './es5';

export function es6Rules(identStart?: ICharClass, identPart?: ICharClass): IRuleSet {
  const destructuring = new UnaryOperatorRule({
    '[': {
      type: ARRAY_PAT,
      close: ']',
      prop: 'elements',
      isPre: true,
      separators: ',',
      sparse: true,
      empty: true,
      trailling: true,

      subRules: ARRAY_PAT,
      extra: checkRest.bind(null, 'elements'),
    },
    '{': {
      type: OBJECT_PAT,
      close: '}',
      prop: 'properties',
      isPre: true,
      separators: ',',
      empty: true,
      trailling: true,
      subRules: OBJECT_PAT,
      extra: (node: INode, ctx: ParserContext) => {
        node.properties = node.properties.map((n: INode) => {
          const ret =
            n.type !== IDENTIFIER_EXP && n.type !== ASSIGN_PAT
              ? n
              : {
                  type: 'Property',
                  key: n.type === IDENTIFIER_EXP ? n : n.left,
                  value: n,
                  kind: 'init',
                  method: false,
                  shorthand: true,
                  computed: false,
                };
          if (n.range) ret.range = n.range;
          return ret;
        });
        return checkRest('properties', node, ctx);
      },
    },
  });

  const rules: IRuleSet = {
    ...es5Rules(identStart, identPart),

    bindElem: [
      new UnaryOperatorRule({ '...': { type: REST_ELE, isPre: true, subRules: PROPERTY } }),
      new BinaryOperatorRule({ '=': { type: ASSIGN_PAT, subRules: NOCOMMA_EXPR } }),
      PROPERTY,
    ],

    destructuringAssignement: [
      new BinaryOperatorRule({ '=': { ...ASSIGN_TYPE, ltypes: undefined } }, true),
      destructuring,
    ],

    [OBJECT_PAT]: [
      new UnaryOperatorRule({ '...': { type: REST_ELE, isPre: true, subRules: PROPERTY } }),
      new TryBranchRule({ subRules: 'property_with_target' }),
      new BinaryOperatorRule({ '=': { type: ASSIGN_PAT, subRules: NOCOMMA_EXPR } }),
      memberRule,
      PROPERTY,
    ],

    property_with_target: [
      new BinaryOperatorRule({ ':': { ...PROPERTY_TYPE, subRules: 'property_target' } }, true),
      new UnaryOperatorRule({ '[': { type: EXPRESSION, close: ']', subRules: NOCOMMA_EXPR } }),
      ...numberRules,
      new StringRule({ LT: true, hex: true, raw: true }),
      PROPERTY,
    ],
    property_target: [
      new BinaryOperatorRule({ '=': { type: ASSIGN_PAT, subRules: NOCOMMA_EXPR } }),
      destructuring,
      memberRule,
      PROPERTY,
    ],

    [ARRAY_PAT]: [
      new UnaryOperatorRule({ '...': { type: REST_ELE, isPre: true, subRules: PROPERTY } }),
      new BinaryOperatorRule({ '=': { type: ASSIGN_PAT, subRules: NOCOMMA_EXPR } }),
      memberRule,
      destructuring,
      PROPERTY,
    ],

    arrow: [
      new BinaryOperatorRule(
        {
          '=>': {
            type: ARROW_EXP,
            subRules: NOCOMMA_EXPR,
            right: 'body',
            left: 'params',
            extra: (node: INode) => {
              node.params = node.params.type !== 'params' ? [node.params] : node.params.params;

              return { ...node, id: null, generator: false, expression: true, async: false };
            },
          },
        },
        true
      ),
      new UnaryOperatorRule({ '(': PARAMS_TYPE }),
      PROPERTY,
    ],
  };

  // add arrow function expressions
  rules[NOCOMMA_EXPR].splice(1, 0, new TryBranchRule({ subRules: 'arrow' }));

  // add de-structuring assignment
  rules[NOCOMMA_EXPR].splice(
    0,
    0,
    new TryBranchRule({ subRules: 'destructuringAssignement', test: '[{' })
  );
  return rules;
}

export class ES6Parser extends Parser {
  constructor(
    noStatement?: boolean,
    identStart?: ICharClass,
    identPart?: ICharClass,
    range?: boolean
  ) {
    super(
      es6Rules(identStart, identPart),
      noStatement ? EXPRESSION : STATEMENT,
      identStart,
      identPart,
      range
    );
  }
}
