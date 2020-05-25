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
  CALL_TYPE,
  EXPRESSION,
  GROUP_TYPE,
  LOGICAL_EXP,
  LOGICAL_TYPE,
  MEMBER_EXP,
  MEMBER_TYPE,
  MEMBER_TYPE_COMP,
  NOCOMMA_EXPR,
  OBJECT,
  opConf,
  SPREAD_EXP,
  STATEMENT,
  TAGGED_EXP,
  UNARY_EXP,
} from './const';
import { es6Rules } from './es6';

export function esNextRules(identStart?: ICharClass, identPart?: ICharClass): IRuleSet {
  // ES2017 allows trailing commas in function calls
  const restoreComma = CALL_TYPE.trailling;
  CALL_TYPE.trailling = true;

  const rules: IRuleSet = {
    ...es6Rules(identStart, identPart),

    Exponential: [
      new TryBranchRule({
        subRules: 'ParentesisExponential',
        test: '(',
      }),
      new BinaryOperatorRule({
        '**': {
          ...BINARY_TYPE,
          subRules: 'Exponential',
          extra: (n) => {
            if (n.left.type === UNARY_EXP)
              throw new Error('Unary operator used immediately before exponentiation expression.');
            return n;
          },
        },
      }),
      UNARY_EXP,
    ],
    ParentesisExponential: [
      new BinaryOperatorRule(
        { '**': { ...BINARY_TYPE, subRules: 'Exponential', type: BINARY_EXP } },
        true
      ),
      new UnaryOperatorRule({ '(': GROUP_TYPE }),
    ],
    Nullish: [new BinaryOperatorRule({ '??': LOGICAL_TYPE }, true), BINARY_EXP],
    ParentesisOptChain: [
      new BinaryOperatorRule(
        {
          '?.': {
            ...MEMBER_TYPE,
            extra: { computed: false, optional: true, shortCircuited: false },
          },

          '?.[': {
            ...MEMBER_TYPE_COMP,
            extra: { computed: true, optional: true, shortCircuited: false },
          },
          '?.(': {
            ...CALL_TYPE,
            extra: { optional: true, shortCircuited: false },
          },

          '.': {
            ...MEMBER_TYPE,
            extra: { computed: false, optional: false, shortCircuited: false },
          },

          '[': {
            ...MEMBER_TYPE_COMP,
            extra: { computed: true, optional: false, shortCircuited: false },
          },
          '(': {
            ...CALL_TYPE,
            extra: { optional: false, shortCircuited: false },
          },
          '`': {
            type: TAGGED_EXP,
            left: 'tag',
            right: 'quasi',
            subRules: 'template',
            extra: { optional: false, shortCircuited: false },
          },
        },
        true
      ),
      new UnaryOperatorRule({ '(': GROUP_TYPE }),
    ],
  };

  // needed to add '**=' to assignment operators
  rules[NOCOMMA_EXPR][1] = new BinaryOperatorRule(
    opConf(
      ['=', '+=', '-=', '*=', '/=', '%=', '>>=', '<<=', '>>>=', '|=', '&=', '^=', '**='],
      ASSIGN_TYPE
    )
  );

  // add exponential operator
  rules[BINARY_EXP].splice(-1, 1, 'Exponential');

  // add object spread
  rules[OBJECT].splice(
    0,
    0,
    new UnaryOperatorRule({ '...': { type: SPREAD_EXP, isPre: true, subRules: NOCOMMA_EXPR } })
  );

  // add nullish coalescing operator
  rules[LOGICAL_EXP].splice(0, 0, new TryBranchRule({ subRules: 'Nullish' }));

  // add optional member operator
  rules[MEMBER_EXP].splice(
    0,
    1,

    new BinaryOperatorRule({
      '?.': {
        ...MEMBER_TYPE,
        extra: (n) => ({
          ...n,
          computed: false,
          optional: true,
          shortCircuited: !!(n.object && (n.object.shortCircuited || n.object.optional)),
        }),
      },

      '?.[': {
        ...MEMBER_TYPE_COMP,
        extra: (n) => ({
          ...n,
          computed: true,
          optional: true,
          shortCircuited: !!(n.object && (n.object.shortCircuited || n.object.optional)),
        }),
      },
      '?.(': {
        ...CALL_TYPE,
        extra: (n) => ({
          ...n,
          optional: true,
          shortCircuited: !!(n.callee && (n.callee.shortCircuited || n.callee.optional)),
        }),
      },

      '.': {
        ...MEMBER_TYPE,
        extra: (n) => ({
          ...n,
          computed: false,
          optional: false,
          shortCircuited: !!(n.object && (n.object.shortCircuited || n.object.optional)),
        }),
      },

      '[': {
        ...MEMBER_TYPE_COMP,
        extra: (n) => ({
          ...n,
          computed: true,
          optional: false,
          shortCircuited: !!(n.object && (n.object.shortCircuited || n.object.optional)),
        }),
      },
      '(': {
        ...CALL_TYPE,
        extra: (n) => ({
          ...n,
          optional: false,
          shortCircuited: !!(n.callee && (n.callee.shortCircuited || n.callee.optional)),
        }),
      },
      '`': {
        type: TAGGED_EXP,
        left: 'tag',
        right: 'quasi',
        subRules: 'template',
        extra: (n, ctx) => {
          if (n.tag && (n.tag.shortCircuited || n.tag.optional))
            throw ctx.err('Invalid tagged template on optional chain');
          return {
            ...n,
            optional: false,
            shortCircuited: false,
          };
        },
      },
    }),
    new TryBranchRule({ subRules: 'ParentesisOptChain', test: '(' })
  );

  // restore definition in case many presets are being used.
  CALL_TYPE.trailling = restoreComma;
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
