/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../parser.interface';
import { StaticEval } from './eval';
import {
  IDENTIFIER_EXP, LITERAL_EXP, MEMBER_EXP, BINARY_EXP, ASSIGN_EXP, UPDATE_EXP, UNARY_EXP
} from '../presets/es5conf';

/** Callback functions to actually perform an operation */
export const
  binaryOpCB = {
    '|': (a, b) => a | b,
    '^': (a, b) => a ^ b,
    '&': (a, b) => a & b,
    '==': (a, b) => a == b, // tslint:disable-line
    '!=': (a, b) => a != b, // tslint:disable-line
    '===': (a, b) => a === b,
    '!==': (a, b) => a !== b,
    '<': (a, b) => a < b,
    '>': (a, b) => a > b,
    '<=': (a, b) => a <= b,
    '>=': (a, b) => a >= b,
    'instanceof': (a, b) => a instanceof b,
    'in': (a, b) => a in b,
    '<<': (a, b) => a << b,
    '>>': (a, b) => a >> b,
    '>>>': (a, b) => a >>> b,
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '%': (a, b) => a % b
  },

  unaryPreOpCB = {
    '-': a => -a,
    '+': a => +a,
    '!': a => !a,
    '~': a => ~a,
    'typeof': a => typeof a,
    'void': a => void a // tslint:disable-line
  },

  assignOpCB = {
    '=': (a, m, b) => a[m] = b,
    '+=': (a, m, b) => a[m] += b,
    '-=': (a, m, b) => a[m] -= b,
    '*=': (a, m, b) => a[m] *= b,
    '/=': (a, m, b) => a[m] /= b,
    '%=': (a, m, b) => a[m] %= b,
    '<<=': (a, m, b) => a[m] <<= b,
    '>>=': (a, m, b) => a[m] >>= b,
    '>>>=': (a, m, b) => a[m] >>>= b,
    '|=': (a, m, b) => a[m] |= b,
    '&=': (a, m, b) => a[m] &= b,
    '^=': (a, m, b) => a[m] ^= b
  },

  preUpdateOpCB = {
    '++': (a, m) => ++a[m],
    '--': (a, m) => --a[m]
  },

  postUpdateOpCB = {
    '++': (a, m) => a[m]++,
    '--': (a, m) => a[m]--
  };

export class ES5StaticEval extends StaticEval {

  lvalue(node: INode, context: object): { o, m } {
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

  /** Rule to evaluate `LiteralExpression` */
  protected Literal(n) {
    return n.value;
  }

  /** Rule to evaluate `IdentifierExpression` */
  protected Identifier(node: INode, context: object) {
    return context[node.name];
  }

  /** Rule to evaluate `ThisExpression` */
  protected ThisExpression(_node: INode, context: object) {
    return context;
  }

  /** Rule to evaluate `ArrayExpression` */
  protected ArrayExpression(node: INode, context: object) {
    return this._resolve(context, (...values) => values, ...node.elements);
  }

  /** Rule to evaluate `ObjectExpression` */
  protected ObjectExpression(node: INode, context: object) {
    const keys = [], nodes = node.properties.map(
      n => {
        let key: string;
        if (n.key.type === IDENTIFIER_EXP) key = n.key.name;
        else if (n.key.type === LITERAL_EXP) key = n.key.value.toString();
        else throw new Error('Invalid property');
        if (keys.indexOf(key) >= 0) throw new Error('Duplicate property');
        keys.push(key);

        return n.value;
      });

    // add callback as first argument
    return this._resolve(context, (...values) => values.reduce((ret, val, i) => (ret[keys[i]] = val, ret), {}), ...nodes);
  }

  /** Rule to evaluate `MemberExpression` */
  protected MemberExpression(node: INode, context: object) {
    return node.computed ?
      this._resolve(context, (obj, prop) => obj[prop], node.object, node.property) :
      this._resolve(context, (obj) => obj[node.property.name], node.object);
  }

  /** Rule to evaluate `CallExpression` */
  protected CallExpression(node: INode, context: object) {
    const funcDef = this._fcall(node, context);

    return funcDef.func.apply(funcDef.obj, funcDef.args);
  }

  /** Rule to evaluate `ConditionalExpression` */
  protected ConditionalExpression(node: INode, context: object) {
    // can't resolve all operands together as it needs short circuit evaluation
    return this._eval(node.test, context) ? this._eval(node.consequent, context) : this._eval(node.alternate, context);
  }

  /** Rule to evaluate `CommaExpression` */
  protected SequenceExpression(node: INode, context: object) {
    return this._resolve(context, (...values) => values.pop(), ...node.expressions);
  }

  /** Rule to evaluate `TemplateLiteral` */
  protected TemplateLiteral(node: INode, context: object) {
    return this._resolve(context, (...values) => values.reduce(
      (r, e, i) => r += e + node.quasis[i + 1].value.cooked, node.quasis[0].value.cooked)
      , ...node.expressions);
  }

  /** Rule to evaluate `LogicalExpression` */
  protected LogicalExpression(node: INode, context: object) {
    // can't resolve all operands together as it needs short circuit evaluation
    switch (node.operator) {
      case '||':
        return this._eval(node.left, context) || this._eval(node.right, context);
      case '&&':
        return this._eval(node.left, context) && this._eval(node.right, context);
      default:
        throw unsuportedError(BINARY_EXP, node.operator);
    }
  }

  /** Rule to evaluate `BinaryExpression` */
  protected BinaryExpression(node: INode, context: object) {
    if (!(node.operator in binaryOpCB)) throw unsuportedError(BINARY_EXP, node.operator);

    return this._resolve(context, binaryOpCB[node.operator], node.left, node.right);
  }

  /** Rule to evaluate `AssignmentExpression` */
  protected AssignmentExpression(node: INode, context: object) {
    if (!(node.operator in assignOpCB)) throw unsuportedError(ASSIGN_EXP, node.operator);
    const left = this.lvalue(node.left, context);

    return assignOpCB[node.operator](left.o, left.m, this._eval(node.right, context));
  }

  /** Rule to evaluate `UpdateExpression` */
  protected UpdateExpression(node: INode, context: object) {
    const cb = node.prefix ? preUpdateOpCB : postUpdateOpCB;
    if (!(node.operator in cb)) throw unsuportedError(UPDATE_EXP, node.operator);
    const left = this.lvalue(node.argument, context);

    return cb[node.operator](left.o, left.m);
  }

  /** Rule to evaluate `UnaryExpression` */
  protected UnaryExpression(node: INode, context: object) {
    if (!(node.operator in unaryPreOpCB)) {
      if (node.operator === 'delete') {
        const obj = this.lvalue(node.argument, context);
        return delete obj.o[obj.m];
      } else throw unsuportedError(UNARY_EXP, node.operator);
    }

    return this._resolve(context, unaryPreOpCB[node.operator], node.argument);
  }

  /** Rule to evaluate `NewExpression` */
  protected NewExpression(node: INode, context: object) {

    return this._resolve(context, (callee, ...args) =>
      new callee(...args), node.callee, ...node.arguments);
  }

  /** Rule to evaluate `ExpressionStatement` */
  protected ExpressionStatement(node: INode, context: object) {
    return this._eval(node.expression, context);
  }

  /** Rule to evaluate `Program` */
  protected Program(node: INode, context: object) {
    return this._resolve(context, (...values) => values.pop(), ...node.body);
  }

  /** Rule to evaluate JSEP's `CompoundExpression` */
  protected Compound(node: INode, context: object) {
    return this.Program(node, context);
  }

  /**
   * Returns a left side value wrapped to be used for assignment
   */

  protected _fcall(node: INode, context: object) {
    let result;
    // capture context in closure for use in callback
    // Getting it from 'this' is not reliable for async evaluation as it may have changed in later evals

    if (node.callee.type === MEMBER_EXP) {
      result = node.computed ?
        this._resolve(context, (obj, prop, ...args) => ({ obj, func: obj[prop], args }), node.callee.object, node.callee.property, ...node.arguments) :
        this._resolve(context, (obj, ...args) => ({ obj, func: obj[node.callee.property.name], args }), node.callee.object, ...node.arguments);
    } else result = this._resolve(context, (func, ...args) => ({ obj: context, func, args }), node.callee, ...node.arguments);

    return result;

  }
}

export function unsuportedError(type: string, operator: string): Error {
  return new Error('Unsuported ' + type + ': ' + operator);
}
export function es5EvalFactory(): StaticEval {
  return new ES5StaticEval();
}
