/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Parser } from '../parser';
import { ICharClass, INode } from '../parser.interface';
import { IRuleSet } from '../parserContext';
import {
  BaseRule,
  BinaryOperatorRule,
  IConfBinaryRule,
  IConfMultipleRule,
  IdentifierRule,
  MultiOperatorRule,
  NumberRule,
  RegexRule,
  StringRule,
  TernaryOperatorRule,
  UnaryOperatorRule,
} from '../rules';

import {
  ARRAY_EXP,
  ARRAY_TYPE,
  ASSIGN_TYPE,
  BINARY_TYPE,
  BINARY_TYPE_SP,
  CALL_EXP,
  CALL_TYPE,
  COMMA_TYPE,
  CONDITIONAL_EXP,
  EXPRESSION,
  EXPRESSION_EXP,
  GROUP_TYPE,
  LITERAL_EXP,
  LOGICAL_TYPE,
  MEMBER_TYPE,
  MEMBER_TYPE_COMP,
  NEW_EXP,
  NOCOMMA_EXPR,
  OBJECT,
  OBJECT_TYPE,
  opConf,
  PROPERTY,
  PROPERTY_TYPE,
  SPREAD_EXP,
  STATEMENT,
  TAGGED_EXP,
  TOKEN,
  UNARY_EXP,
  UNARY_TYPE_PRE,
  UNARY_TYPE_PRE_SP,
  UPDATE_TYPE,
  UPDATE_TYPE_PRE,
} from './const';
import { es5IdentifierConf } from './identStartConf';

const PROGRAM_CONF: IConfMultipleRule = {
  type: 'Program',
  prop: 'body',
  extra: { sourceType: 'script' },
  separators: ';\n',
  sparse: { type: 'EmptyStatement' },
  trailling: true,
  empty: true,
};

const biOpConfs: IConfBinaryRule[] = [
  { '||': LOGICAL_TYPE },
  { '&&': LOGICAL_TYPE },
  { '|': BINARY_TYPE },
  { '^': BINARY_TYPE },
  { '&': BINARY_TYPE },
  opConf(['==', '!=', '===', '!=='], BINARY_TYPE),
  opConf([['<', '>', '<=', '>='], ['instanceof', 'in']], [BINARY_TYPE, BINARY_TYPE_SP]),
  opConf(['<<', '>>', '>>>'], BINARY_TYPE),
  opConf(['+', '-'], BINARY_TYPE),
  opConf(['*', '/', '%'], BINARY_TYPE),
];

export function es5Rules(identStart?: ICharClass, identPart?: ICharClass): IRuleSet {
  // basic tokens used also in parsing object literal's properties
  const numberRules: Array<BaseRule<any>> = [
    new NumberRule({ radix: 16, prefix: '0x' }),
    new NumberRule({ radix: 8, prefix: '0o' }),
    new NumberRule({ radix: 2, prefix: '0b' }),
    new NumberRule(),
  ];

  // object needs subset of tokens for parsing properties.
  const tokenRules = numberRules.concat([
    new StringRule({ LT: true, hex: true, raw: true, templateRules: EXPRESSION }),
    new IdentifierRule(es5IdentifierConf(identStart, identPart)),
    new UnaryOperatorRule({ '[': ARRAY_TYPE }),
    new RegexRule(),
    new UnaryOperatorRule({ '{': OBJECT_TYPE }),
  ]);

  const newRule = new UnaryOperatorRule({
    new: {
      type: NEW_EXP,
      prop: 'callee',
      isPre: true,
      space: true,
      subRules: NEW_EXP,
      extra: (node: INode) => {
        if (node.callee.type !== CALL_EXP) node.arguments = [];
        else {
          node.arguments = node.callee.arguments;
          node.callee = node.callee.callee;
        }
        return node;
      },
    },
  });

  return {
    [STATEMENT]: [
      new MultiOperatorRule(PROGRAM_CONF),
      new MultiOperatorRule({
        type: EXPRESSION_EXP,
        prop: EXPRESSION,
        extra: (node: INode) =>
          node.expression.type === LITERAL_EXP && typeof node.expression.value === 'string'
            ? {
              ...node,
              directive: node.expression.raw.substring(1, node.expression.raw.length - 1),
            }
            : node,
      }),
      EXPRESSION,
    ],
    [EXPRESSION]: [new MultiOperatorRule(COMMA_TYPE), NOCOMMA_EXPR],
    [NOCOMMA_EXPR]: [
      new BinaryOperatorRule(
        opConf(
          ['=', '+=', '-=', '*=', '/=', '%=', '>>=', '<<=', '>>>=', '|=', '&=', '^='],
          ASSIGN_TYPE
        )
      ),

      new TernaryOperatorRule({ type: CONDITIONAL_EXP, subRules: NOCOMMA_EXPR }),

      ...biOpConfs.map(conf => new BinaryOperatorRule(conf)),
      UNARY_EXP,
    ],

    [UNARY_EXP]: [
      new UnaryOperatorRule(
        opConf(
          [['+', '-', '!', '~'], ['typeof', 'void', 'delete'], ['++', '--']],
          [UNARY_TYPE_PRE, UNARY_TYPE_PRE_SP, UPDATE_TYPE_PRE]
        )
      ),
      new UnaryOperatorRule(opConf(['++', '--'], UPDATE_TYPE)),
      new BinaryOperatorRule({
        '.': MEMBER_TYPE,
        '[': MEMBER_TYPE_COMP,
        '(': CALL_TYPE,
        '`': { type: TAGGED_EXP, left: 'tag', right: 'quasi', subRules: 'template' },
      }),
      newRule,
      new UnaryOperatorRule({ '(': GROUP_TYPE }),
      TOKEN,
    ],

    [TOKEN]: tokenRules,

    // auxiliary branches
    // member identifier (allows reserved words)
    [PROPERTY]: [new IdentifierRule({ identStart, identPart })],
    // new operator

    [NEW_EXP]: [
      newRule,
      new BinaryOperatorRule({ '(': CALL_TYPE }),
      new BinaryOperatorRule({
        '.': MEMBER_TYPE,
        '[': MEMBER_TYPE_COMP,
      }),
      new UnaryOperatorRule({ '(': GROUP_TYPE }),
      TOKEN,
    ],

    // object literal
    [OBJECT]: [
      new BinaryOperatorRule({ ':': PROPERTY_TYPE }),
      new UnaryOperatorRule({ '[': { type: EXPRESSION, close: ']', subRules: NOCOMMA_EXPR } }),

      ...numberRules,
      new IdentifierRule({ identStart, identPart }),
      new StringRule({ LT: true, hex: true, raw: true }),
    ],

    [ARRAY_EXP]: [
      new UnaryOperatorRule({
        '...': { type: SPREAD_EXP, isPre: true, subRules: NOCOMMA_EXPR },
      }),
      NOCOMMA_EXPR,
    ],
    template: [
      new StringRule({
        LT: true,
        hex: true,
        raw: true,
        unquoted: false,
        templateRules: EXPRESSION,
      }),
    ],
  };
}

export class ES5Parser extends Parser {
  constructor(noStatement?: boolean, identStart?: ICharClass, identPart?: ICharClass, range?: boolean) {
    super(es5Rules(identStart, identPart), noStatement ? EXPRESSION : STATEMENT, identStart, identPart, range);
  }
}
