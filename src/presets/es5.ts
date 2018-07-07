/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Parser, BaseRule } from '../parser';
import { es5ConditionalConf, es5BiOpConfs, es5PreUnaryOp, es5MemberConf, es5GroupingConf, es5ArrayConf, es5CommaOpConf, es5PostUnaryOpConf, es5AssignOpConf, identStartConf, identPartConf, es5IdentifierConf } from './es5conf';
import { confMultipleRule, MultiOperatorRule } from '../rules/operator/multiple';
import { TernaryOperatorRule } from '../rules/operator/ternary';
import { BinaryOperatorRule } from '../rules/operator/binary';
import { UnaryOperatorRule } from '../rules/operator/unary';
import { GroupingOperatorRule } from '../rules/operator/grouping';
import { WrapperRule } from '../rules/operator/wrapper';
import { StringRule } from '../rules/token/string';
import { NumberRule } from '../rules/token/number';
import { IdentifierRule, confIdentifierChars } from '../rules/token/identifier';
import { ArrayRule } from '../rules/token/array';
import { RegexRule } from '../rules/token/regex';
import { ObjectRule } from '../rules/token/object';

const esprimaStatementConf: confMultipleRule = {
  type: 'Program',
  prop: 'body', extra: { sourceType: 'script' },
  separator: ';', sp: false, lt: true,
  empty: { type: 'EmptyStatement' }
};

export function es5Rules(identifier: confIdentifierChars = { st: identStartConf, pt: identPartConf }): BaseRule[][] {

  // basic tokens used also in parsing object literal's properties
  let numberRules: BaseRule[] = [
    new NumberRule({ radix: 16, prefix: /^0x/i }),
    new NumberRule({ radix: 8, prefix: /^0o/i }),
    new NumberRule({ radix: 2, prefix: /^0b/i }),
    new NumberRule()

  ];

  // properties can have reserved words as names
  const PropertyRule = new IdentifierRule({ thisStr: null, literals: {} });

  // object needs subset of tokens for parsing properties.
  const tokenRules = numberRules.concat([
    new StringRule({ LT: true, hex: true, raw: true, templateRule: { level: 1 } }),
    new IdentifierRule(es5IdentifierConf(identifier, { level: 5 })),
    new ArrayRule(es5ArrayConf),
    new RegexRule(),
    new ObjectRule({
      key: {
        rules: [numberRules.concat(
          new StringRule({ LT: true, hex: true, raw: true, templateRule: null }),
          PropertyRule)]
      },
      value: { level: 2 }
    })]);

  return [
    // statement level
    [ new MultiOperatorRule(esprimaStatementConf),
      new WrapperRule({ type: 'ExpressionStatement', wrap: 'expression' })],
    // expression levels
    [new MultiOperatorRule(es5CommaOpConf)],
    [new BinaryOperatorRule(es5AssignOpConf)],
    [new TernaryOperatorRule(es5ConditionalConf)],
    es5BiOpConfs.map(conf => new BinaryOperatorRule(conf)),
    [
      new UnaryOperatorRule({ pre: true, op: { ...es5PreUnaryOp[0], ...es5PreUnaryOp[1], ...es5PreUnaryOp[2] } }),
      new UnaryOperatorRule(es5PostUnaryOpConf),
      new BinaryOperatorRule(es5MemberConf([[PropertyRule]])),
      new GroupingOperatorRule(es5GroupingConf)],

    tokenRules
  ];
}

export function es5ParserFactory(): Parser {
  return new Parser(es5Rules());
}
