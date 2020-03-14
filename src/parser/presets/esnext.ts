/*!
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Parser } from '../parser';
import { ICharClass } from '../parser.interface';
import { IRuleSet } from '../parserContext';
import { BinaryOperatorRule, TryBranchRule, UnaryOperatorRule } from '../rules';

import {
  ASSIGN_TYPE,
  BINARY_EXP,
  BINARY_TYPE,
  EXPRESSION,
  GROUP_TYPE,
  NOCOMMA_EXPR,
  OBJECT,
  opConf,
  SPREAD_EXP,
  STATEMENT,
  UNARY_EXP,
} from './const';
import { es6Rules } from './es6';

export function esNextRules(identStart?: ICharClass, identPart?: ICharClass): IRuleSet {
  const rules: IRuleSet = {
    ...es6Rules(identStart, identPart),

    Exponential: [
      new TryBranchRule({
        subRules: 'ParentesisExponential',
        extra: n => {
          // only match (...) **
          if (n.type !== 'Exponential') throw new Error();
          n.type = BINARY_EXP;
          return n;
        },
      }),
      new BinaryOperatorRule({
        '**': {
          ...BINARY_TYPE,
          subRules: 'Exponential',
          extra: n => {
            if (n.left.type === UNARY_EXP)
              throw new Error('Unary operator used immediately before exponentiation expression.');
            return n;
          },
        },
      }),
      UNARY_EXP,
    ],
    ParentesisExponential: [
      new BinaryOperatorRule({
        '**': { ...BINARY_TYPE, subRules: 'Exponential', type: 'Exponential' },
      }),
      new UnaryOperatorRule({ '(': GROUP_TYPE }),
    ],
  };

  // needed to add '**=' to assignment operators
  rules[NOCOMMA_EXPR][0] = new BinaryOperatorRule(
    opConf(
      ['=', '+=', '-=', '*=', '/=', '%=', '>>=', '<<=', '>>>=', '|=', '&=', '^=', '**='],
      ASSIGN_TYPE
    )
  );

  // add exponential operator
  rules[NOCOMMA_EXPR][rules[NOCOMMA_EXPR].length - 1] = 'Exponential';

  // add object spread
  rules[OBJECT].splice(
    0,
    0,
    new UnaryOperatorRule({ '...': { type: SPREAD_EXP, isPre: true, subRules: NOCOMMA_EXPR } })
  );

  return rules;
}

export class ESnextParser extends Parser {
  constructor(
    noStatement?: boolean,
    identStart?: ICharClass,
    identPart?: ICharClass,
    range?: boolean
  ) {
    super(
      esNextRules(identStart, identPart),
      noStatement ? EXPRESSION : STATEMENT,
      identStart,
      identPart,
      range
    );
  }
}
