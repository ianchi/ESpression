import { BaseRule, Parser } from '../parser';
import { confBinaryRule, BinaryOperatorRule } from '../rules/operator/binary';
import { confMultipleRule, MultiOperatorRule } from '../rules/operator/multiple';
import { es5Rules } from './es5';
import { IdentifierRule } from '../rules/token/identifier';
import { GroupingOperatorRule } from '../rules/operator/grouping';
import { NumberRule } from '../rules/token/number';
import { StringRule } from '../rules/token/string';
import { LiteralRule } from '../rules/token/literal';
import { UnaryOperatorRule } from '../rules/operator/unary';

function jsPathMemberConf(memberRule: BaseRule[][], computedRule: BaseRule[][]): confBinaryRule {
  return {
    '.': {
      type: 'JPChildExpression',
      extra: { computed: false },
      noop: true,
      left: 'object', right: 'property',
      rules: memberRule
    },
    '[': {
      type: 'JPChildExpression',
      left: 'object', right: 'property',
      extra: { computed: true },
      close: ']',
      noop: true,
      rules: computedRule
    },
    '..': {
      type: 'JPDescendantExpression',
      extra: { computed: false },
      noop: true,
      left: 'object', right: 'property',
      rules: memberRule
    },
    '..[': {
      type: 'JPDescendantExpression',
      left: 'object', right: 'property',
      extra: { computed: true },
      close: ']',
      noop: true,
      rules: computedRule
    }
  };
}

function jsComputedRules(): BaseRule[][] {
  const UNARY_EXP = { type: 'UnaryExpression' };

  return [
    [
      new MultiOperatorRule({
        type: 'JPUnionExpression',
        prop: 'expressions', separator: ','
      })],
    [
      new GroupingOperatorRule({
        type: 'JPExpression',
        prop: 'expression',
        open: '(', close: ')', rules: es5Rules()
      }),
      new GroupingOperatorRule({
        type: 'JPFilterExpression',
        prop: 'expression',
        open: '?(', close: ')', rules: es5Rules()
      })],
    [
      new MultiOperatorRule({
        type: 'JPSliceExpression',
        prop: 'expressions', separator: ':',
        empty: null, maxSep: 2
      })],
    [
      new UnaryOperatorRule({
        pre: true, op: {
          '-': UNARY_EXP,
          '+': UNARY_EXP
        }})],
    [
      new NumberRule({ radix: 10, int: true, noexp: true }),
      new StringRule(),
      new LiteralRule({ type: 'JPWildcard', start: '*', literals: { '*': true } })
    ]

  ];
}

export function jsonPathRules(): BaseRule[][] {
  // properties can have reserved words as names

  return [
    [new BinaryOperatorRule(jsPathMemberConf([[
      new IdentifierRule({ thisStr: null, literals: {} }),
      new LiteralRule({ type: 'JPWildcard', start: '*', literals: { '*': true } })]],
      jsComputedRules()))],
    [new LiteralRule({ type: 'JPRoot', prop: 'name', literals: null })]
  ];

}

export function jsonPathFactory(): Parser {
  return new Parser(jsonPathRules());
}
