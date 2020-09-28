/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Parser } from '../parser';
import { INode } from '../parser.interface';
import { IRuleSet } from '../parserContext';
import {
  BinaryOperatorRule,
  IConfBinaryRule,
  IConfMultipleRule,
  IdentifierRule,
  MultiOperatorRule,
  NumberRule,
  StringRule,
  TernaryOperatorRule,
  UnaryOperatorRule,
} from '../rules';

import {
  ARRAY_TYPE,
  BINARY_TYPE,
  BINARY_TYPE_SP,
  CALL_TYPE,
  CONDITIONAL_EXP,
  EXPRESSION,
  GROUP_TYPE,
  LOGICAL_TYPE,
  MEMBER_TYPE,
  MEMBER_TYPE_COMP,
  NOCOMMA_EXPR,
  opConf,
  PROPERTY,
  STATEMENT,
  TOKEN,
  UNARY_TYPE_PRE,
} from './const';
import { es5IdentifierConf } from './identStartConf';

const COMPOUND_CONF: IConfMultipleRule = {
  type: 'Compound',
  prop: 'body',
  separators: ',; \n\0',
  sparse: true,
  trailling: true,
  empty: true,
  // remove empty slots and bypass Compound node for single expressions
  extra: (node: INode) => {
    node.body = node.body.filter((n: INode) => n);
    return node.body.length === 1 ? node.body[0] : node;
  },
};

const biOpConfs: IConfBinaryRule[] = [
  { '||': LOGICAL_TYPE },
  { '&&': LOGICAL_TYPE },
  { '|': BINARY_TYPE },
  { '^': BINARY_TYPE },
  { '&': BINARY_TYPE },
  opConf(['==', '!=', '===', '!=='], BINARY_TYPE),
  opConf(['<', '>', '<=', '>='], BINARY_TYPE_SP),
  opConf(['<<', '>>', '>>>'], BINARY_TYPE),
  opConf(['+', '-'], BINARY_TYPE),
  opConf(['*', '/', '%'], BINARY_TYPE),
];
export function basicRules(): IRuleSet {
  return {
    [STATEMENT]: [new MultiOperatorRule(COMPOUND_CONF), EXPRESSION],
    [EXPRESSION]: [NOCOMMA_EXPR],
    [NOCOMMA_EXPR]: [
      new TernaryOperatorRule({ type: CONDITIONAL_EXP }),
      ...biOpConfs.map((conf) => new BinaryOperatorRule(conf)),

      new UnaryOperatorRule(opConf(['+', '-', '!', '~'], UNARY_TYPE_PRE)),
      new BinaryOperatorRule({
        '.': MEMBER_TYPE,
        '[': MEMBER_TYPE_COMP,
        '(': CALL_TYPE,
      }),
      new UnaryOperatorRule({ '(': GROUP_TYPE }),
      TOKEN,
    ],
    [TOKEN]: [
      // last level must be base tokens
      new StringRule({ LT: false, hex: false, raw: false }),
      new NumberRule(),
      new IdentifierRule(es5IdentifierConf()),
      new UnaryOperatorRule({ '[': { ...ARRAY_TYPE, subRules: NOCOMMA_EXPR } }),
    ],

    [PROPERTY]: [new IdentifierRule({ this: true })],
  };
}

export class BasicParser extends Parser {
  constructor() {
    super(basicRules(), STATEMENT);
  }
}
