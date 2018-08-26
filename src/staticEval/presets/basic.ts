/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser';
import { BINARY_EXP, MEMBER_EXP, UNARY_EXP } from '../../parser/presets';

import { ILvalue, keyedObject, StaticEval, unsuportedError } from '../eval';

// tslint:disable:no-bitwise
// tslint:disable:no-unsafe-any
/** Callback functions to actually perform an operation */
export const binaryOpCB: { [operator: string]: (a: any, b: any) => any } = {
    '|': (a: any, b: any) => a | b,
    '^': (a: any, b: any) => a ^ b,
    '&': (a: any, b: any) => a & b,
    '==': (a: any, b: any) => a == b, // tslint:disable-line
    '!=': (a: any, b: any) => a != b, // tslint:disable-line
    '===': (a: any, b: any) => a === b,
    '!==': (a: any, b: any) => a !== b,
    '<': (a: any, b: any) => a < b,
    '>': (a: any, b: any) => a > b,
    '<=': (a: any, b: any) => a <= b,
    '>=': (a: any, b: any) => a >= b,
    instanceof: (a: any, b: any) => a instanceof b,
    in: (a: any, b: any) => a in b,
    '<<': (a: any, b: any) => a << b,
    '>>': (a: any, b: any) => a >> b,
    '>>>': (a: any, b: any) => a >>> b,
    '+': (a: any, b: any) => a + b,
    '-': (a: any, b: any) => a - b,
    '*': (a: any, b: any) => a * b,
    '/': (a: any, b: any) => a / b,
    '%': (a: any, b: any) => a % b,
  },
  unaryOpCB: { [operator: string]: (a: any) => any } = {
    '-': (a: any) => -a,
    '+': (a: any) => +a,
    '!': (a: any) => !a,
    '~': (a: any) => ~a,
    typeof: (a: any) => typeof a,
    void: (a: any) => void a, // tslint:disable-line
  };

export class BasicEval extends StaticEval {
  /** Dummy implemantation, it is not used */
  lvalue(_node: INode, _context: keyedObject): ILvalue {
    return { o: {}, m: '' };
  }

  /** Rule to evaluate `LiteralExpression` */
  protected Literal(n: INode): any {
    return n.value;
  }

  /** Rule to evaluate `IdentifierExpression` */
  protected Identifier(node: INode, context: keyedObject): any {
    return context[node.name];
  }

  /** Rule to evaluate `ThisExpression` */
  protected ThisExpression(_node: INode, context: keyedObject): any {
    return context;
  }

  /** Rule to evaluate `ArrayExpression` */
  protected ArrayExpression(node: INode, context: keyedObject): any {
    return this._resolve(context, (...values) => values, ...node.elements);
  }

  /** Rule to evaluate `MemberExpression` */
  protected MemberExpression(node: INode, context: keyedObject): any {
    return node.computed
      ? this._resolve(context, (obj, prop) => obj[prop], node.object, node.property)
      : this._resolve(context, obj => obj[node.property.name], node.object);
  }

  /** Rule to evaluate `CallExpression` */
  protected CallExpression(node: INode, context: keyedObject): any {
    const funcDef = this._fcall(node, context);

    return funcDef.func.apply(funcDef.obj, funcDef.args);
  }

  /** Rule to evaluate `ConditionalExpression` */
  protected ConditionalExpression(node: INode, context: keyedObject): any {
    // can't resolve all operands together as it needs short circuit evaluation
    return this._eval(node.test, context)
      ? this._eval(node.consequent, context)
      : this._eval(node.alternate, context);
  }

  /** Rule to evaluate `CommaExpression` */
  protected SequenceExpression(node: INode, context: keyedObject): any {
    return this._resolve(context, (...values) => values.pop(), ...node.expressions);
  }

  /** Rule to evaluate `LogicalExpression` */
  protected LogicalExpression(node: INode, context: keyedObject): any {
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
  protected BinaryExpression(node: INode, context: keyedObject): any {
    if (!(node.operator in binaryOpCB)) throw unsuportedError(BINARY_EXP, node.operator);

    return this._resolve(context, binaryOpCB[node.operator], node.left, node.right);
  }

  /** Rule to evaluate `UnaryExpression` */
  protected UnaryExpression(node: INode, context: keyedObject): any {
    if (!(node.operator in unaryOpCB)) throw unsuportedError(UNARY_EXP, node.operator);

    return this._resolve(context, unaryOpCB[node.operator], node.argument);
  }

  /** Rule to evaluate `ExpressionStatement` */
  protected ExpressionStatement(node: INode, context: keyedObject): any {
    return this._eval(node.expression, context);
  }

  /** Rule to evaluate `Program` */
  protected Program(node: INode, context: keyedObject): any {
    return this._resolve(context, (...values) => values.pop(), ...node.body);
  }

  /** Rule to evaluate JSEP's `CompoundExpression` */
  protected Compound(node: INode, context: keyedObject): any {
    return this.Program(node, context);
  }

  /**
   * Returns a left side value wrapped to be used for assignment
   */

  protected _fcall(node: INode, context: keyedObject): any {
    let result;
    // capture context in closure for use in callback
    // Getting it from 'this' is not reliable for async evaluation as it may have changed in later evals

    if (node.callee.type === MEMBER_EXP) {
      result = node.computed
        ? this._resolve(
            context,
            (obj, prop, ...args) => ({ obj, func: obj[prop], args }),
            node.callee.object,
            node.callee.property,
            ...node.arguments
          )
        : this._resolve(
            context,
            (obj, ...args) => ({ obj, func: obj[node.callee.property.name], args }),
            node.callee.object,
            ...node.arguments
          );
    } else
      result = this._resolve(
        context,
        (func, ...args) => ({ obj: context, func, args }),
        node.callee,
        ...node.arguments
      );

    return result;
  }
}
