/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser';
import {
  ASSIGN_EXP,
  IDENTIFIER_EXP,
  LITERAL_EXP,
  MEMBER_EXP,
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

  /** Rule to evaluate `ObjectExpression` */
  protected ObjectExpression(node: INode, context: keyedObject): any {
    const keys: string[] = [],
      nodes = node.properties.map((n: INode) => {
        let key: string;
        if (n.key.type === IDENTIFIER_EXP) key = n.key.name;
        else if (n.key.type === LITERAL_EXP) key = n.key.value.toString();
        else throw new Error('Invalid property');
        if (keys.indexOf(key) >= 0) throw new Error('Duplicate property');
        keys.push(key);

        return n.value;
      });

    // add callback as first argument
    return this._resolve(
      context,
      (...values) => values.reduce((ret, val, i) => ((ret[keys[i]] = val), ret), {}),
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

  /** Rule to evaluate `AssignmentExpression` */
  protected AssignmentExpression(node: INode, context: keyedObject): any {
    if (!(node.operator in assignOpCB)) throw unsuportedError(ASSIGN_EXP, node.operator);
    const left = this.lvalue(node.left, context);

    return assignOpCB[node.operator](left.o, left.m, this._eval(node.right, context));
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
