/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../parser';

export type evalFn = (expression: INode) => any;

export type keyedObject = { [key: string]: any }; // tslint:disable-line:interface-over-type-literal

export interface ILvalue {
  o: keyedObject;
  m: string;
}
/**
 * Abstract Base class to be customized with specific rules.
 *
 * Implementations must derive from it and add one private method named after each `AST.type`
 * it handles evaluation. The method must have the signature: `(expression: INode) => any`
 */
export abstract class StaticEval {
  [evalFn: string]: any;
  /**
   * Evaluates an expression in an optionally provided context
   * @param expression AST to evaluate
   * @param context Optional custom contex object. Defaults to empty context `{}`
   */
  evaluate(expression: INode, context?: object): any {
    return this._eval(expression, context || {});
  }

  abstract lvalue(node: INode, context: object): ILvalue;
  /**
   * Calls the corresponding eval function, with a mandatory context
   * Implementation of expression evaluation functions should call this version for evaluating subexpressions
   * as it enforces passing arround the context.
   * @param expression
   * @param context
   */
  protected _eval(expression: INode, context: keyedObject): any {
    if (!(expression.type in this))
      throw new Error('Unsupported expression type: ' + expression.type);
    return this[expression.type](expression, context);
  }

  /**
   * Performs the actual evaluation using the supplied callback
   * invoked with the pre evaluated operands
   *
   * @param operatorCB Callback function to *execute* the actual expression
   * @param operands Operands to sub eval and use to call the callback
   */
  protected _resolve(
    context: object,
    operatorCB: (...operands: any[]) => any,
    ...operands: INode[]
  ): any {
    const results = operands.map(node => (node || undefined) && this._eval(node, context));

    return operatorCB(...results);
  }
}

export function unsuportedError(type: string, operator: string): Error {
  return new Error('Unsuported ' + type + ': ' + operator);
}
