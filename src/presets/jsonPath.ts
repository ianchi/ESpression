/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BaseRule, Parser } from '../parser';
import { confBinaryRule, BinaryOperatorRule } from '../rules/operator/binary';
import { MultiOperatorRule } from '../rules/operator/multiple';
import { es5Rules } from './es5';
import { IdentifierRule } from '../rules/token/identifier';
import { GroupingOperatorRule } from '../rules/operator/grouping';
import { NumberRule } from '../rules/token/number';
import { StringRule } from '../rules/token/string';
import { LiteralRule } from '../rules/token/literal';
import { UnaryOperatorRule } from '../rules/operator/unary';
import { UNARY_EXP, identPartConf, identStartConf } from './es5conf';

export const
  JPCHILD_EXP = 'JPChildExpression',
  JPDESC_EXP = 'JPDescendantExpression',
  JPUNION_EXP = 'JPUnionExpression',
  JPFILTER_EXP = 'JPFilterExpression',
  JPSLICE_EXP = 'JPSliceExpression',
  JPWILDCARD_EXP = 'JPWildcard',
  JPEXP_EXP = 'JPExpression';

const JPWILDCARD_TYPE = { type: JPWILDCARD_EXP, start: '*', literals: { '*': true } },
  EXPRESSION = 'expression',
  EXPRESSIONS = EXPRESSION + 's',
  PROPERTY = 'property',
  OBJECT = 'object';

function jsPathMemberConf(memberRule: BaseRule[][], computedRule: BaseRule[][]): confBinaryRule {
  return {
    '.': {
      type: JPCHILD_EXP,
      extra: { computed: false },
      noop: true,
      left: OBJECT, right: PROPERTY,
      rules: memberRule
    },
    '[': {
      type: JPCHILD_EXP,
      left: OBJECT, right: PROPERTY,
      extra: { computed: true },
      close: ']',
      noop: true,
      rules: computedRule
    },
    '..': {
      type: JPDESC_EXP,
      extra: { computed: false },
      noop: true,
      left: OBJECT, right: PROPERTY,
      rules: memberRule
    },
    '..[': {
      type: JPDESC_EXP,
      left: OBJECT, right: PROPERTY,
      extra: { computed: true },
      close: ']',
      noop: true,
      rules: computedRule
    }
  };
}

function jsComputedRules(): BaseRule[][] {
  const UNARY_TYPE = { type: UNARY_EXP };
  const subrules = es5Rules({
    pt: identPartConf,
    st: { ...identStartConf, re: /[@$_A-Za-z]/ }  // adds '@' as valid identifier start
  });

  return [
    [
      new MultiOperatorRule({
        type: JPUNION_EXP,
        prop: EXPRESSIONS, separator: ','
      })],
    [
      new GroupingOperatorRule({
        type: JPEXP_EXP,
        prop: EXPRESSION,
        open: '(', close: ')', rules: subrules
      }),
      new GroupingOperatorRule({
        type: JPFILTER_EXP,
        prop: EXPRESSION,
        open: '?(', close: ')', rules: subrules
      })],
    [
      new MultiOperatorRule({
        type: JPSLICE_EXP,
        prop: EXPRESSIONS, separator: ':',
        empty: null, maxSep: 2
      })],
    [
      new UnaryOperatorRule({
        pre: true, op: {
          '-': UNARY_TYPE,
          '+': UNARY_TYPE
        }
      })],
    [
      new NumberRule({ radix: 10, int: true, noexp: true }),
      new StringRule(),
      new LiteralRule(JPWILDCARD_TYPE)
    ]

  ];
}

export function jsonPathRules(): BaseRule[][] {
  // properties can have reserved words as names

  return [
    [new BinaryOperatorRule(jsPathMemberConf([[
      new IdentifierRule({ thisStr: undefined, literals: {} }),
      new LiteralRule(JPWILDCARD_TYPE)]],
      jsComputedRules()))],
    [new LiteralRule({ type: 'JPRoot', prop: 'name', literals: undefined })]
  ];

}

export function es5PathParserFactory(): Parser {

  const esPathRules = es5Rules();

  // add the '<$..path>' notation as jsonPath operand, with priority just before tokens

  esPathRules[esPathRules.length - 2].push(
    new GroupingOperatorRule({ open: '<', close: '>', rules: jsonPathRules() })
  );
  return new Parser(esPathRules);

}
export function jsonPathParserFactory(): Parser {

  return new Parser(jsonPathRules());
}
