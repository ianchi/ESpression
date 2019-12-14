/*!
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Parser } from '..';
import { ICharClass, INode } from '../parser.interface';
import { IRuleSet } from '../parserContext';
import { BinaryOperatorRule, TryBranchRule, UnaryOperatorRule } from '../rules';

import {
  ARROW_EXP,
  ASSIGN_PAT,
  EXPRESSION,
  NOCOMMA_EXPR,
  PARAMS_TYPE,
  PROPERTY,
  REST_ELE,
  STATEMENT,
} from './const';
import { es5Rules } from './es5';

export function es6Rules(identStart?: ICharClass, identPart?: ICharClass): IRuleSet {
  const rules: IRuleSet = {
    ...es5Rules(identStart, identPart),

    bindElem: [
      new UnaryOperatorRule({ '...': { type: REST_ELE, isPre: true, subRules: PROPERTY } }),
      new BinaryOperatorRule({ '=': { type: ASSIGN_PAT, subRules: NOCOMMA_EXPR } }),
      PROPERTY,
    ],

    arrow: [
      new BinaryOperatorRule({
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
      }),
      new UnaryOperatorRule({ '(': PARAMS_TYPE }),
      PROPERTY,
    ],
  };

  rules[NOCOMMA_EXPR].splice(
    1,
    0,
    new TryBranchRule({
      subRules: 'arrow',
      extra: (node: INode) => {
        if (node.type !== ARROW_EXP) throw new Error();
        return node;
      },
    })
  );
  return rules;
}

export class ES6Parser extends Parser {
  constructor(noStatement?: boolean, identStart?: ICharClass, identPart?: ICharClass, range?: boolean) {
    super(es6Rules(identStart, identPart), noStatement ? EXPRESSION : STATEMENT, identStart, identPart, range);
  }
}
