/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser';
import {
  ARRAY_PAT,
  ASSIGN_EXP,
  CALL_EXP,
  IDENTIFIER_EXP,
  LITERAL_EXP,
  MEMBER_EXP,
  OBJECT_PAT,
  REST_ELE,
  SPREAD_EXP,
  UPDATE_EXP,
} from '../../parser/presets';
import { ILvalue, keyedObject, unsuportedError } from '../eval';

import { BasicEval } from './basic';

// tslint:disable:no-bitwise
/** Callback functions to actually perform an operation */
export const assignOpCB: { [operator: string]: (a: keyedObject, m: string, b: any) => any } = {
    '=': (a: keyedObject, m: string, b: any) => (a[m] = b),
    '+=': (a: keyedObject, m: string, b: any) => (a[m] += b),
    '-=': (a: keyedObject, m: string, b: any) => (a[m] -= b),
    '*=': (a: keyedObject, m: string, b: any) => (a[m] *= b),
    '/=': (a: keyedObject, m: string, b: any) => (a[m] /= b),
    '%=': (a: keyedObject, m: string, b: any) => (a[m] %= b),
    '**=': (a: keyedObject, m: string, b: any) => (a[m] **= b),
    '<<=': (a: keyedObject, m: string, b: any) => (a[m] <<= b),
    '>>=': (a: keyedObject, m: string, b: any) => (a[m] >>= b),
    '>>>=': (a: keyedObject, m: string, b: any) => (a[m] >>>= b),
    '|=': (a: keyedObject, m: string, b: any) => (a[m] |= b),
    '&=': (a: keyedObject, m: string, b: any) => (a[m] &= b),
    '^=': (a: keyedObject, m: string, b: any) => (a[m] ^= b),
  },
  preUpdateOpCB: { [operator: string]: (a: keyedObject, m: string) => any } = {
    '++': (a: keyedObject, m: string) => ++a[m],
    '--': (a: keyedObject, m: string) => --a[m],
  },
  postUpdateOpCB: { [operator: string]: (a: keyedObject, m: string) => any } = {
    '++': (a: keyedObject, m: string) => a[m]++,
    '--': (a: keyedObject, m: string) => a[m]--,
  };
// tslint:enable:no-unsafe-any
export class ES5StaticEval extends BasicEval {
  lvalue(node: INode, context: keyedObject): ILvalue {
    let obj, member;
    switch (node.type) {
      case IDENTIFIER_EXP:
        obj = context;
        member = node.name;
        break;
      case MEMBER_EXP:
        obj = this._eval(node.object, context);
        member = node.computed ? this._eval(node.property, context) : node.property.name;
        break;
      default:
        throw new Error('Invalid left side expression');
    }

    return { o: obj, m: member };
  }

  /** Rule to evaluate `ArrayExpression` with spread operator */
  protected ArrayExpression(node: INode, context: keyedObject): any {
    return this._resolve(
      context,
      (...values) => {
        const result: any[] = [];
        node.elements.forEach((n: INode, i: number) => {
          if (n && n.type === SPREAD_EXP) {
            for (const val of values[i]) result.push(val);
          } else if (n) result.push(values[i]);
          else result.length++;
        });
        return result;
      },
      ...node.elements.map((n: any) => (n && n.type === SPREAD_EXP ? n.argument : n))
    );
  }
  /** Rule to evaluate `ObjectExpression` */
  protected ObjectExpression(node: INode, context: keyedObject): any {
    const keys: Array<string | undefined> = [],
      computedNodes: INode[] = [],
      computed: number[] = [],
      spread: number[] = [],
      nodes = node.properties.map((n: INode, i: number) => {
        let key: string;
        if (n.type === SPREAD_EXP) {
          keys.push(undefined);
          spread.push(i);
          return n.argument;
        } else if (n.computed) {
          keys.push(undefined);
          computed.push(i);
          computedNodes.push(n.key);
        } else {
          if (n.key.type === IDENTIFIER_EXP) key = n.key.name;
          else if (n.key.type === LITERAL_EXP) key = n.key.value.toString();
          else throw new Error('Invalid property');
          keys.push(key);
        }
        return n.value;
      });

    // add callback as first argument
    return this._resolve(
      context,
      (...args) => {
        // completed resolved key names
        computed.forEach(idx => (keys[idx] = args.shift()));
        // generate object
        return args.reduce((ret, val, i) => {
          if (spread.indexOf(i) >= 0) Object.keys(val ?? {}).forEach(key => (ret[key] = val[key]));
          else ret[keys[i]!] = val;
          return ret;
        }, {});
      },
      ...computedNodes,
      ...nodes
    );
  }

  /** Rule to evaluate `TemplateLiteral` */
  protected TemplateLiteral(node: INode, context: keyedObject): any {
    return this._resolve(
      context,
      (...values) =>
        values.reduce(
          (r, e, i) => (r += e + node.quasis[i + 1].value.cooked),
          node.quasis[0].value.cooked
        ),
      ...node.expressions
    );
  }

  protected TaggedTemplateExpression(node: INode, context: keyedObject): any {
    return this.CallExpression(
      {
        type: CALL_EXP,
        callee: node.tag,
        optional: node.optional,
        shortCircuited: node.shortCircuited,
        arguments: [node.quasi.quasis, ...node.quasi.expressions],
      },
      context
    );
  }

  _assignPattern(node: INode, operator: string, right: any, context: any): any {
    switch (node.type) {
      case ARRAY_PAT:
        if (!Array.isArray(right)) throw new Error('TypeError: must be array');

        for (let i = 0; i < node.elements.length; i++) {
          if (!node.elements[i]) continue;

          if (node.elements[i].type === REST_ELE)
            this._assignPattern(node.elements[i].argument, operator, right.slice(i), context);
          else this._assignPattern(node.elements[i], operator, right[i], context);
        }
        break;

      case OBJECT_PAT:
        if (right === null || typeof right === 'undefined')
          throw new Error('TypeError: must be convertible to object');

        const visited: any = {};
        for (let i = 0; i < node.properties.length; i++) {
          if (node.properties[i].type === REST_ELE) {
            const rest = Object.keys(right)
              .filter(k => !(k in visited))
              .reduce((r: any, k) => ((r[k] = right[k]), r), {});
            this._assignPattern(node.properties[i].argument, operator, rest, context);
          } else {
            const key = node.properties[i].computed
              ? this._eval(node.properties[i].key, context)
              : node.properties[i].key.type === LITERAL_EXP
              ? node.properties[i].key.value
              : node.properties[i].key.name;
            visited[key] = true;
            this._assignPattern(node.properties[i].value, operator, right[key], context);
          }
        }

        break;

      case 'AssignmentPattern':
        if (typeof right === 'undefined') right = this._eval(node.right, context);

        return this._assignPattern(node.left, operator, right, context);

      default:
        const left = this.lvalue(node, context);

        return assignOpCB[operator](left.o, left.m, right);
    }

    return right;
  }

  /** Rule to evaluate `AssignmentExpression` */
  protected AssignmentExpression(node: INode, context: keyedObject): any {
    if (!(node.operator in assignOpCB)) throw unsuportedError(ASSIGN_EXP, node.operator);

    const right = this._eval(node.right, context);

    return this._assignPattern(node.left, node.operator, right, context);
  }

  /** Rule to evaluate `UpdateExpression` */
  protected UpdateExpression(node: INode, context: keyedObject): any {
    const cb = node.prefix ? preUpdateOpCB : postUpdateOpCB;
    if (!(node.operator in cb)) throw unsuportedError(UPDATE_EXP, node.operator);
    const left = this.lvalue(node.argument, context);

    return cb[node.operator](left.o, left.m);
  }

  /** Rule to evaluate `UnaryExpression` */
  protected UnaryExpression(node: INode, context: keyedObject): any {
    if (node.operator === 'delete') {
      const obj = this.lvalue(node.argument, context);
      return delete obj.o[obj.m];
    } else return super.UnaryExpression(node, context);
  }

  /** Rule to evaluate `NewExpression` */
  protected NewExpression(node: INode, context: keyedObject): any {
    return this._resolve(
      context,
      (callee, ...args) => new callee(...args),
      node.callee,
      ...node.arguments
    );
  }
}
