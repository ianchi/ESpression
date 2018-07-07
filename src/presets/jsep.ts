/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Parser, BaseRule } from '../parser';
import { es5ConditionalConf, es5BiOpConfs, es5PreUnaryOp, es5MemberConf, es5GroupingConf, es5ArrayConf, es5IdentifierConf } from './es5conf';
import { confMultipleRule, MultiOperatorRule } from '../rules/operator/multiple';
import { TernaryOperatorRule } from '../rules/operator/ternary';
import { BinaryOperatorRule } from '../rules/operator/binary';
import { UnaryOperatorRule } from '../rules/operator/unary';
import { GroupingOperatorRule } from '../rules/operator/grouping';
import { StringRule } from '../rules/token/string';
import { NumberRule } from '../rules/token/number';
import { IdentifierRule } from '../rules/token/identifier';
import { ArrayRule } from '../rules/token/array';

const jsepStatementConf: confMultipleRule = {
  type: 'Compound',
  prop: 'body',
  separator: ',;', sp: true, lt: true, implicit: true,
  empty: true, single: true
};
export function jsepRules(): BaseRule[][] {

  // remove unsopported binary operators
  const jsepBiOpRules = es5BiOpConfs.slice();
  jsepBiOpRules[6] = { ...es5BiOpConfs[6] };
  delete jsepBiOpRules[6].instanceof;
  delete jsepBiOpRules[6].in;

  return [
    [new MultiOperatorRule(jsepStatementConf)], // statement level
    [new BaseRule()], // dummy rule to keep the same level order and reuse rules def
    [new TernaryOperatorRule(es5ConditionalConf)],
    jsepBiOpRules.map(conf => new BinaryOperatorRule(conf)),
    [
      new UnaryOperatorRule({ pre: true, op: es5PreUnaryOp[0] }),
      new BinaryOperatorRule(es5MemberConf([[new IdentifierRule(es5IdentifierConf())]])),
      new GroupingOperatorRule(es5GroupingConf)],
    [ // last level must be base tokens
      new StringRule({ LT: false, hex: false, raw: false }),
      new NumberRule(),
      new IdentifierRule(es5IdentifierConf()),
      new ArrayRule(es5ArrayConf)
    ]
  ];
}

export function jsepParserFactory(): Parser {
  return new Parser(jsepRules());
}
