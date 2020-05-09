/*
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../parser.interface';
import { ParserContext } from '../parserContext';
import { IConfBinaryOp, IConfMultipleRule, IConfUnaryOp } from '../rules';

export const BINARY_EXP = 'BinaryExpression',
  LOGICAL_EXP = 'LogicalExpression',
  ASSIGN_EXP = 'AssignmentExpression',
  ASSIGN_PAT = 'AssignmentPattern',
  ARRAY_PAT = 'ArrayPattern',
  OBJECT_PAT = 'ObjectPattern',
  LITERAL_EXP = 'Literal',
  TEMPLATE_EXP = 'TemplateLiteral',
  TEMPLATE_ELE = 'TemplateElement',
  TAGGED_EXP = 'TaggedTemplateExpression',
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
  NEW_EXP = 'NewExpression',
  EXPRESSION_EXP = 'ExpressionStatement',
  SPREAD_EXP = 'SpreadElement',
  REST_ELE = 'RestElement',
  ARROW_EXP = 'ArrowFunctionExpression',
  OPER = 'operator',
  PREFIX = 'prefix',
  OBJECT = 'object',
  PROPERTY = 'property',
  EXPRESSION = 'expression',
  EXPRESSIONS = EXPRESSION + 's',
  STATEMENT = 'statement',
  NOCOMMA_EXPR = 'nocomma_expr',
  TOKEN = 'token';

export function checkRest(attr: string, node: INode, ctx: ParserContext): INode {
  const rest = (node[attr] as [INode]).findIndex((n) => n && n.type === REST_ELE);
  if (rest >= 0 && rest !== node[attr].length - 1) ctx.err('rest element must be the last');

  return node;
}
export const BINARY_TYPE: IConfBinaryOp = { type: BINARY_EXP, oper: OPER },
  BINARY_TYPE_SP: IConfBinaryOp = { ...BINARY_TYPE, space: true },
  LOGICAL_TYPE: IConfBinaryOp = { type: LOGICAL_EXP, oper: OPER },
  ASSIGN_TYPE: IConfBinaryOp = {
    type: ASSIGN_EXP,
    ltypes: [IDENTIFIER_EXP, MEMBER_EXP],
    oper: OPER,
    rasoc: true,
    subRules: NOCOMMA_EXPR,
  },
  UNARY_TYPE: IConfUnaryOp = { type: UNARY_EXP, oper: OPER, prefix: PREFIX },
  UNARY_TYPE_PRE: IConfUnaryOp = { ...UNARY_TYPE, isPre: true },
  UNARY_TYPE_PRE_SP: IConfUnaryOp = { ...UNARY_TYPE_PRE, space: true },
  UPDATE_TYPE: IConfUnaryOp = {
    type: UPDATE_EXP,
    oper: OPER,
    prefix: PREFIX,
    types: [IDENTIFIER_EXP, MEMBER_EXP],
  },
  UPDATE_TYPE_PRE: IConfUnaryOp = { ...UPDATE_TYPE, isPre: true },
  ARRAY_TYPE: IConfUnaryOp = {
    type: ARRAY_EXP,
    prop: 'elements',
    close: ']',
    separators: ',',
    sparse: true,
    trailling: true,
    empty: true,
    subRules: ARRAY_EXP,
  },
  PARAMS_TYPE: IConfUnaryOp = {
    type: 'params',
    prop: 'params',
    close: ')',
    separators: ',',
    trailling: true,
    empty: true,
    subRules: 'bindElem',
    extra: checkRest.bind(null, 'params'),
  },
  ARRAY_PAT_TYPE: IConfUnaryOp = {
    type: ARRAY_PAT,
    close: ']',
    prop: 'elements',
    isPre: true,
    separators: ',',
    sparse: true,
    empty: true,
    trailling: true,

    subRules: ARRAY_PAT,
    extra: checkRest.bind(null, 'elements'),
  },
  OBJECT_PAT_TYPE: IConfUnaryOp = {
    type: OBJECT_PAT,
    close: '}',
    prop: 'properties',
    isPre: true,
    separators: ',',
    empty: true,
    trailling: true,
    subRules: OBJECT_PAT,
    extra: (node: INode, ctx: ParserContext) => {
      node.properties = node.properties.map((n: INode) => {
        const ret =
          n.type !== IDENTIFIER_EXP && n.type !== ASSIGN_PAT
            ? n
            : {
                type: 'Property',
                key: n.type === IDENTIFIER_EXP ? n : n.left,
                value: n,
                kind: 'init',
                method: false,
                shorthand: true,
                computed: false,
              };
        if (n.range) ret.range = n.range;
        return ret;
      });
      return checkRest('properties', node, ctx);
    },
  },
  OBJECT_TYPE: IConfUnaryOp = {
    type: OBJECT_EXP,
    prop: 'properties',
    close: '}',
    separators: ',',
    trailling: true,
    empty: true,
    subRules: OBJECT,
    types: [IDENTIFIER_EXP, 'Property', SPREAD_EXP],
    extra: (node: INode) => (
      (node.properties = node.properties.map((n: INode) => {
        const ret =
          n.type !== IDENTIFIER_EXP
            ? n
            : {
                type: 'Property',
                key: n,
                value: n,
                kind: 'init',
                method: false,
                shorthand: true,
                computed: false,
              };
        if (n.range) ret.range = n.range;
        return ret;
      })),
      node
    ),
  },
  PROPERTY_TYPE: IConfBinaryOp = {
    type: 'Property',
    left: 'key',
    right: 'value',

    extra: (node: INode) => ({
      ...node,
      key: node.key.type === EXPRESSION ? node.key.argument : node.key,
      kind: 'init',
      method: false,
      shorthand: false,
      computed: node.key.type === EXPRESSION,
    }),
    subRules: NOCOMMA_EXPR,
  },
  COMMA_TYPE: IConfMultipleRule = { type: SEQUENCE_EXP, prop: EXPRESSIONS, separators: ',' },
  GROUP_TYPE: IConfUnaryOp = { close: ')', subRules: EXPRESSION },
  MEMBER_TYPE: IConfBinaryOp = {
    type: MEMBER_EXP,
    left: OBJECT,
    right: PROPERTY,
    extra: { computed: false },
    subRules: PROPERTY,
  },
  MEMBER_TYPE_COMP: IConfBinaryOp = {
    ...MEMBER_TYPE,
    close: ']',
    extra: { computed: true },
    subRules: EXPRESSION,
  },
  CALL_TYPE: IConfBinaryOp = {
    type: CALL_EXP,
    left: 'callee',
    right: 'arguments',
    separators: ',',
    close: ')',
    empty: true,
    subRules: NOCOMMA_EXPR,
  };

export function opConf<T>(
  operators: string[] | string[][],
  config: T | T[]
): { [operator: string]: T } {
  const res: { [operator: string]: T } = {};
  if (!Array.isArray(config)) config = [config];
  if (!Array.isArray(operators[0])) operators = [<string[]>operators];

  for (let i = 0; i < config.length; i++)
    for (let o = 0; o < operators[i].length; o++) res[operators[i][o]] = config[i];

  return res;
}
