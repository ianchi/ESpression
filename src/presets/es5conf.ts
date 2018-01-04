import { confBinaryRule } from '../rules/operator/binary';
import { confUnaryRule } from '../rules/operator/unary';
import { confTernaryRule } from '../rules/operator/ternary';
import { confMultipleRule } from '../rules/operator/multiple';
import { BaseRule } from '../parser';

// shared binary operators configurations

const BINARY_EXP = { type: 'BinaryExpression' },
  LOGICAL_EXP = { type: 'LogicalExpression' };

export const es5BiOpConfs: confBinaryRule[] = [
  { '||': LOGICAL_EXP },
  { '&&': LOGICAL_EXP },
  { '|': BINARY_EXP },
  { '^': BINARY_EXP },
  { '&': BINARY_EXP },
  {
    '==': BINARY_EXP,
    '!=': BINARY_EXP,
    '===': BINARY_EXP,
    '!==': BINARY_EXP
  }, {
    '<': BINARY_EXP,
    '>': BINARY_EXP,
    '<=': BINARY_EXP,
    '>=': BINARY_EXP,
    'instanceof': { type: 'BinaryExpression', space: true },
    'in': { type: 'BinaryExpression', space: true }
  }, {
    '<<': BINARY_EXP,
    '>>': BINARY_EXP,
    '>>>': BINARY_EXP
  }, {
    '+': BINARY_EXP,
    '-': BINARY_EXP
  }, {
    '*': BINARY_EXP,
    '/': BINARY_EXP,
    '%': BINARY_EXP
  }];

// member conf needs configuration of '.' operator
export function es5MemberConf(memberRule: BaseRule[][]): confBinaryRule {
  return {
    '.': {
      type: 'MemberExpression',
      extra: { computed: false },
      noop: true,
      left: 'object', right: 'property',
      rules: memberRule
    },
    '(': {
      type: 'CallExpression',
      left: 'callee', right: 'arguments',
      multi: ',', close: ')', empty: true,
      level: 2,
      noop: true
    },
    '[': {
      type: 'MemberExpression',
      left: 'object', right: 'property',
      extra: { computed: true },
      close: ']',
      level: 1,
      noop: true
    }
  };
}

// shared unary operatos configurations

const UNARY_EXP = 'UnaryExpression';

export const es5PreUnaryOp = [
  {
    '-': { type: UNARY_EXP },
    '+': { type: UNARY_EXP },
    '!': { type: UNARY_EXP },
    '~': { type: UNARY_EXP }
  }, {
    'typeof': { type: UNARY_EXP, space: true },
    'void': { type: UNARY_EXP, space: true },
    'delete': { type: UNARY_EXP, space: true }
  }, {
    '--': { type: UNARY_EXP },
    '++': { type: UNARY_EXP }
  }];

export const es5PostUnaryOpConf: confUnaryRule = {
  pre: false,
  op: {
    '--': { type: UNARY_EXP },
    '++': { type: UNARY_EXP }
  }
};

// multiple operator configurations

export const es5CommaOpConf: confMultipleRule = {
  type: 'SequenceExpression',
  prop: 'expressions', separator: ','
};

// ternary operator configurations

export const es5ConditionalConf: confTernaryRule = {
  type: 'ConditionalExpression',
  firstOp: '?', secondOp: ':',
  left: 'test', middle: 'consequent', right: 'alternate'
};

// basic rules
export const es5ArrayConf = { type: 'ArrayExpression', level: 2 };

export const es5GroupingConf = { open: '(', close: ')', level: 1 };
