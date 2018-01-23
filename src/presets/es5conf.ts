import { confBinaryRule } from '../rules/operator/binary';
import { confUnaryRule } from '../rules/operator/unary';
import { confTernaryRule } from '../rules/operator/ternary';
import { confMultipleRule } from '../rules/operator/multiple';
import { BaseRule } from '../parser';

// shared binary operators configurations

export const
  BINARY_EXP = 'BinaryExpression',
  LOGICAL_EXP = 'LogicalExpression',
  ASSIGN_EXP = 'AssignmentExpression',
  LITERAL_EXP = 'Literal',
  IDENTIFIER_EXP = 'Identifier',
  THIS_EXP = 'ThisExpression',
  ARRAY_EXP = 'ArrayExpression',
  OBJECT_EXP = 'ObjectExpression',
  MEMBER_EXP = 'MemberExpression',
  CALL_EXP = 'CallExpression',
  CONDITIONAL_EXP = 'ConditionalExpression',
  SEQUENCE_EXP = 'SequenceExpression',
  UPDATE_EXP = 'UpdateExpression',
  UNARY_EXP = 'UnaryExpression',
  NEW_EXP = 'NewExpression';

const BINARY_TYPE = { type: BINARY_EXP },
  BINARY_TYPE_SP = { type: BINARY_EXP, space: true },
  LOGICAL_TYPE = { type: LOGICAL_EXP },
  ASSIGN_TYPE = { type: ASSIGN_EXP, ltypes: [IDENTIFIER_EXP, MEMBER_EXP] },
  UNARY_TYPE = { type: UNARY_EXP },
  UNARY_TYPE_SP = { type: UNARY_EXP, space: true },
  UPDATE_TYPE = { type: UPDATE_EXP, types: [IDENTIFIER_EXP, MEMBER_EXP] };

export const es5BiOpConfs: confBinaryRule[] = [
  { '||': LOGICAL_TYPE },
  { '&&': LOGICAL_TYPE },
  { '|': BINARY_TYPE },
  { '^': BINARY_TYPE },
  { '&': BINARY_TYPE },
  {
    '==': BINARY_TYPE,
    '!=': BINARY_TYPE,
    '===': BINARY_TYPE,
    '!==': BINARY_TYPE
  }, {
    '<': BINARY_TYPE,
    '>': BINARY_TYPE,
    '<=': BINARY_TYPE,
    '>=': BINARY_TYPE,
    'instanceof': BINARY_TYPE_SP,
    'in': BINARY_TYPE_SP
  }, {
    '<<': BINARY_TYPE,
    '>>': BINARY_TYPE,
    '>>>': BINARY_TYPE
  }, {
    '+': BINARY_TYPE,
    '-': BINARY_TYPE
  }, {
    '*': BINARY_TYPE,
    '/': BINARY_TYPE,
    '%': BINARY_TYPE
  }];

export const es5AssignOpConf = {
  '=': ASSIGN_TYPE,

  '+=': ASSIGN_TYPE,
  '-=': ASSIGN_TYPE,
  '*=': ASSIGN_TYPE,
  '/=': ASSIGN_TYPE,
  '%=': ASSIGN_TYPE,

  '<<=': ASSIGN_TYPE,
  '>>=': ASSIGN_TYPE,
  '>>>=': ASSIGN_TYPE,

  '|=': ASSIGN_TYPE,
  '&=': ASSIGN_TYPE,
  '^=': ASSIGN_TYPE
};

// member conf needs configuration of '.' operator
export function es5MemberConf(memberRule: BaseRule[][]): confBinaryRule {
  return {
    '.': {
      type: MEMBER_EXP,
      extra: { computed: false },
      noop: true,
      left: 'object', right: 'property',
      rules: memberRule
    },
    '(': {
      type: CALL_EXP,
      left: 'callee', right: 'arguments',
      multi: ',', close: ')', empty: true,
      level: 2,
      noop: true
    },
    '[': {
      type: MEMBER_EXP,
      left: 'object', right: 'property',
      extra: { computed: true },
      close: ']',
      level: 1,
      noop: true
    }
  };
}

// shared unary operatos configurations

export const es5PreUnaryOp = [
  {
    '-': UNARY_TYPE,
    '+': UNARY_TYPE,
    '!': UNARY_TYPE,
    '~': UNARY_TYPE
  }, {
    'typeof': UNARY_TYPE_SP,
    'void': UNARY_TYPE_SP,
    'delete': UNARY_TYPE_SP
  }, {
    '--': UPDATE_TYPE,
    '++': UPDATE_TYPE
  }];

export const es5PostUnaryOpConf: confUnaryRule = {
  pre: false,
  op: {
    '--': UPDATE_TYPE,
    '++': UPDATE_TYPE
  }
};

// multiple operator configurations

export const es5CommaOpConf: confMultipleRule = {
  type: SEQUENCE_EXP,
  prop: 'expressions', separator: ','
};

// ternary operator configurations

export const es5ConditionalConf: confTernaryRule = {
  type: CONDITIONAL_EXP,
  firstOp: '?', secondOp: ':',
  left: 'test', middle: 'consequent', right: 'alternate'
};

// basic rules
export const es5ArrayConf = { type: ARRAY_EXP, level: 2 };

export const es5GroupingConf = { open: '(', close: ')', level: 1 };
