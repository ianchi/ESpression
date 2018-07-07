/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../parser.interface';

export type evalFn = (expression: INode) => any;

/**
 * Abstract Base class to be customized with specific rules.
 *
 * Implementations must derive from it and add one private method named after each `AST.type`
 * it handles evaluation. The method must have the signature: `(expression: INode) => any`
 */
export abstract class StaticEval {

  /** Context for the current evaluation */
  protected context = {};

  /**
   * Evaluates an expression in a provided context
   * @param expression AST to evaluate
   * @param context Optional custom contex object. Defaults to empty context `{}`
   */
  eval(expression: INode, context?: object) {
    // save context in case we are in nested evals
    const oldContext = this.context;
    this.context = context || {};

    const result = this._eval(expression);

    // restore context
    this.context = oldContext;

    return result;
  }

  /**
   * Makes a *subevaluation* in the current context
   * @param expression AST to evaluate
   */
  protected _eval(expression: INode) {

    if (!(expression.type in this)) throw new Error('Unsupported expression type: ' + expression.type);

    return this[expression.type](expression);

  }

  /**
   * Performs the actual evaluation using the supplied callback
   * invoked with the pre evaluated operands
   *
   * @param operatorCB Callback function to *execute* the actual expression
   * @param operands Operands to sub eval and use to call the callback
   */
  protected _resolve(operatorCB: (...operands) => any, ...operands: INode[]) {

    let results = operands.map(node => this._eval(node));

    return operatorCB.apply(undefined, results);
  }
}
