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
import { UNARY_EXP } from './es5conf';

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
        open: '(', close: ')', rules: es5Rules()
      }),
      new GroupingOperatorRule({
        type: JPFILTER_EXP,
        prop: EXPRESSION,
        open: '?(', close: ')', rules: es5Rules()
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
      new IdentifierRule({ thisStr: null, literals: {} }),
      new LiteralRule(JPWILDCARD_TYPE)]],
      jsComputedRules()))],
    [new LiteralRule({ type: 'JPRoot', prop: 'name', literals: null })]
  ];

}

export function jsonPathFactory(): Parser {
  return new Parser(jsonPathRules());
}
