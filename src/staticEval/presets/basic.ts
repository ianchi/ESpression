/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser';
import { BINARY_EXP, MEMBER_EXP, UNARY_EXP } from '../../parser/presets';
import { ILvalue, keyedObject, StaticEval, unsuportedError } from '../eval';

/* eslint-disable no-bitwise */

/** Callback functions to actually perform an operation */
export const binaryOpCB: { [operator: string]: (a: any, b: any) => any } = {
  '|': (a: any, b: any) => a | b,
  '^': (a: any, b: any) => a ^ b,
  '&': (a: any, b: any) => a & b,
  '==': (a: any, b: any) => a == b, // eslint-disable-line
  '!=': (a: any, b: any) => a != b, // eslint-disable-line
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
  '+': (a: any, b: any) => a + b, // eslint-disable-line
  '-': (a: any, b: any) => a - b,
  '*': (a: any, b: any) => a * b,
  '/': (a: any, b: any) => a / b,
  '%': (a: any, b: any) => a % b,
  '**': (a: any, b: any) => a ** b,
};
export const unaryOpCB: { [operator: string]: (a: any) => any } = {
  '-': (a: any) => -a,
  '+': (a: any) => +a,
  '!': (a: any) => !a,
  '~': (a: any) => ~a,
  typeof: (a: any) => typeof a,
  // eslint-disable-next-line no-void
  void: (a: any) => void a,
};

export const RESOLVE_NORMAL = 0;
export const RESOLVE_SHORT_CIRCUITED = 1;
export const RESOLVE_MEMBER = 2;

export class BasicEval extends StaticEval {
  /** Dummy implementation, it is not used */
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
    return this._resolve(context, 0, (...values: any[]) => values, ...node.elements);
  }

  /** Rule to evaluate `MemberExpression` */
  protected MemberExpression(node: INode, context: keyedObject): any {
    return this._member(node, context, (val) => val && val.o[val.m]);
  }

  protected _MemberObject(node: INode, context: keyedObject): any {
    return this._member(node, context, (val) => val);
  }

  protected _member<T>(
    node: INode,
    context: keyedObject,
    project: (m: ILvalue | undefined) => T
  ): T {
    const short = node.optional || node.shortCircuited;
    return this._resolve(
      context,
      short ? RESOLVE_MEMBER + RESOLVE_SHORT_CIRCUITED : RESOLVE_MEMBER,
      (o: any, m: any) =>
        short
          ? o === null || typeof o === 'undefined'
            ? project(undefined)
            : node.computed
            ? this._resolve(
                context,
                RESOLVE_NORMAL,
                (prop) => project({ o, m: prop }),
                node.property
              )
            : project({ o, m: node.property.name })
          : project({ o, m: node.computed ? m : node.property.name }),
      node.object,
      short || !node.computed ? undefined : node.property
    );
  }

  /** Rule to evaluate `CallExpression` */
  protected CallExpression(node: INode, context: keyedObject): any {
    const short = node.optional || node.shortCircuited;
    // eslint-disable-next-line @typescript-eslint/ban-types
    const project = (obj: any, func: Function, args: any[]): any => {
      if (short && (func === null || typeof func === 'undefined')) return undefined;
      if (typeof func !== 'function') throw new TypeError('Callee is not a function');

      return short
        ? this._resolve(context, RESOLVE_NORMAL, (...ar) => func.apply(obj, ar), ...node.arguments)
        : func.apply(obj, args);
    };

    return this._resolve(
      context,
      RESOLVE_SHORT_CIRCUITED, // always resolve short circuited, as called function could return observable
      (def, ...args) =>
        node.callee.type === MEMBER_EXP
          ? project(def?.o, def?.o[def.m], args)
          : project(context, def, args),
      node.callee.type === MEMBER_EXP ? { ...node.callee, type: '_MemberObject' } : node.callee,
      ...(short ? [] : node.arguments)
    );
  }

  /** Rule to evaluate `ConditionalExpression` */
  protected ConditionalExpression(node: INode, context: keyedObject): any {
    // can't resolve all operands together as it needs short circuit evaluation
    return this._resolve(
      context,
      RESOLVE_SHORT_CIRCUITED,
      (t) => this._eval(t ? node.consequent : node.alternate, context),
      node.test
    );
  }

  /** Rule to evaluate `CommaExpression` */
  protected SequenceExpression(node: INode, context: keyedObject): any {
    return this._resolve(
      context,
      RESOLVE_NORMAL,
      (...values: any[]) => values.pop(),
      ...node.expressions
    );
  }

  /** Rule to evaluate `LogicalExpression` */
  protected LogicalExpression(node: INode, context: keyedObject): any {
    // can't resolve all operands together as it needs short circuit evaluation

    return this._resolve(
      context,
      RESOLVE_SHORT_CIRCUITED,
      (test) => {
        switch (node.operator) {
          case '||':
            return test || this._eval(node.right, context);
          case '&&':
            return test && this._eval(node.right, context);
          case '??':
            return test ?? this._eval(node.right, context);
          case '##':
            return this._eval(node.right, context);
          default:
            throw unsuportedError(BINARY_EXP, node.operator);
        }
      },
      node.left
    );
  }

  /** Rule to evaluate `BinaryExpression` */
  protected BinaryExpression(node: INode, context: keyedObject): any {
    if (!(node.operator in binaryOpCB)) throw unsuportedError(BINARY_EXP, node.operator);

    return this._resolve(context, RESOLVE_NORMAL, binaryOpCB[node.operator], node.left, node.right);
  }

  /** Rule to evaluate `UnaryExpression` */
  protected UnaryExpression(node: INode, context: keyedObject): any {
    if (!(node.operator in unaryOpCB)) throw unsuportedError(UNARY_EXP, node.operator);

    return this._resolve(context, RESOLVE_NORMAL, unaryOpCB[node.operator], node.argument);
  }

  /** Rule to evaluate `ExpressionStatement` */
  protected ExpressionStatement(node: INode, context: keyedObject): any {
    return this._eval(node.expression, context);
  }

  /** Rule to evaluate `Program` */
  protected Program(node: INode, context: keyedObject): any {
    return this._resolve(context, RESOLVE_NORMAL, (...values: any[]) => values.pop(), ...node.body);
  }

  /** Rule to evaluate JSEP's `CompoundExpression` */
  protected Compound(node: INode, context: keyedObject): any {
    return this.Program(node, context);
  }
}
