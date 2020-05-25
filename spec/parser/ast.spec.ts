/**
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import 'jasmine';
import { createAstSpec, deepEqual } from '../helpers/references';
import { INode } from '../../src/main';

const tests: Array<{ expr: string; fail?: boolean; ast?: INode }> = [
  {
    expr: 'obj?.aaa?.bbb',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            optional: true, // If `obj.aaa` was nullish, this node is evaluated to undefined.
            shortCircuited: true, // If `obj` was nullish, this node is short-circuited.
            object: {
              type: 'MemberExpression',
              optional: true, // If `obj` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'aaa' },
              computed: false,
            },
            property: { type: 'Identifier', name: 'bbb' },
            computed: false,
          },
        },
      ],
    },
  },
  {
    expr: 'obj?.aaa.bbb',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            optional: false, // If `obj.aaa` was nullish, this node is evaluated to throwing TypeError.
            shortCircuited: true, // If `obj` was nullish, this node is short-circuited.
            object: {
              type: 'MemberExpression',
              optional: true, // If `obj` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'aaa' },
              computed: false,
            },
            property: { type: 'Identifier', name: 'bbb' },
            computed: false,
          },
        },
      ],
    },
  },
  {
    expr: '(obj?.aaa)?.bbb',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            optional: true, // If `obj.aaa` was nullish, this node is evaluated to undefined.
            shortCircuited: false, // This node isn't short-circuited.
            object: {
              type: 'MemberExpression',
              optional: true, // If `obj` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'aaa' },
              computed: false,
            },
            property: { type: 'Identifier', name: 'bbb' },
            computed: false,
          },
        },
      ],
    },
  },
  {
    expr: '(obj?.aaa).bbb',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            optional: false, // If `obj.aaa` was nullish, this node is evaluated to throwing TypeError.
            shortCircuited: false, // This node isn't short-circuited.
            object: {
              type: 'MemberExpression',
              optional: true, // If `obj` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'aaa' },
              computed: false,
            },
            property: { type: 'Identifier', name: 'bbb' },
            computed: false,
          },
        },
      ],
    },
  },
  {
    expr: 'func?.()?.bbb',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            optional: true, // If the result of `func()` was nullish, this node is evaluated to undefined.
            shortCircuited: true, // If `func` was nullish, this node is short-circuited.
            object: {
              type: 'CallExpression',
              optional: true, // If `func` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              callee: { type: 'Identifier', name: 'func' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'bbb' },
            computed: false,
          },
        },
      ],
    },
  },
  {
    expr: 'func?.().bbb',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            optional: false, // If the result of `func()` was nullish, this node is evaluated to throwing TypeError.
            shortCircuited: true, // If `func` was nullish, this node is short-circuited.
            object: {
              type: 'CallExpression',
              optional: true, // If `func` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              callee: { type: 'Identifier', name: 'func' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'bbb' },
            computed: false,
          },
        },
      ],
    },
  },
  {
    expr: '(func?.())?.bbb',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            optional: true, // If the result of `func()` was nullish, this node is evaluated to undefined.
            shortCircuited: false, // This node isn't short-circuited.
            object: {
              type: 'CallExpression',
              optional: true, // If `func` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              callee: { type: 'Identifier', name: 'func' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'bbb' },
            computed: false,
          },
        },
      ],
    },
  },
  {
    expr: '(func?.()).bbb',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            optional: false, // If the result of `func()` was nullish, this node is evaluated to throwing TypeError.
            shortCircuited: false, // This node isn't short-circuited.
            object: {
              type: 'CallExpression',
              optional: true, // If `func` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              callee: { type: 'Identifier', name: 'func' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'bbb' },
            computed: false,
          },
        },
      ],
    },
  },
  {
    expr: 'obj?.aaa?.()',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            optional: true, // If `obj.aaa` was nullish, this node is evaluated to undefined.
            shortCircuited: true, // If `obj` was nullish, this node is short-circuited.
            callee: {
              type: 'MemberExpression',
              optional: true, // If `obj` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'aaa' },
              computed: false,
            },
            arguments: [],
          },
        },
      ],
    },
  },
  {
    expr: 'obj?.aaa()',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            optional: false, // If `obj.aaa` was nullish, this node is evaluated to throwing TypeError.
            shortCircuited: true, // If `obj` was nullish, this node is short-circuited.
            callee: {
              type: 'MemberExpression',
              optional: true, // If `obj` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'aaa' },
              computed: false,
            },
            arguments: [],
          },
        },
      ],
    },
  },
  {
    expr: '(obj?.aaa)?.()',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            optional: true, // If `obj.aaa` was nullish, this node is evaluated to undefined.
            shortCircuited: false, // This node isn't short-circuited.
            callee: {
              type: 'MemberExpression',
              optional: true, // If `obj` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'aaa' },
              computed: false,
            },
            arguments: [],
          },
        },
      ],
    },
  },
  {
    expr: '(obj?.aaa)()',
    ast: {
      sourceType: 'script',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            optional: false, // If `obj.aaa` was nullish, this node is evaluated to throwing TypeError.
            shortCircuited: false, // This node isn't short-circuited.
            callee: {
              type: 'MemberExpression',
              optional: true, // If `obj` was nullish, this node is evaluated to undefined.
              shortCircuited: false, // This node isn't short-circuited.
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'aaa' },
              computed: false,
            },
            arguments: [],
          },
        },
      ],
    },
  },
  {
    expr: 'c?.d`test`',
    fail: true,
  },
  {
    expr: 'c?.d?.`test`',
    fail: true,
  },
];

describe('Basic ESnext expressions', () => {
  beforeEach(() => {
    jasmine.addCustomEqualityTester(deepEqual);
  });

  for (const test of tests) createAstSpec(test);
});
