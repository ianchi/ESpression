import { INode } from '../parser.interface';

export type evalFn = (expression: INode, staticEval: StaticEval) => any;
export class StaticEval {
  context = {};
  constructor(public rules: { [type: string]: evalFn }) {
    if (!rules) this.rules = {};
  }

  register(type: string, fn: evalFn) {
    this.rules[type] = fn;
  }

  eval(expression: INode, context?: object) {
    const old = this.context;
    this.context = context || {};
    const ret = this._eval(expression);
    this.context = old;
    return ret;
  }

  _eval(expression: INode) {

    if (!(expression.type in this.rules)) throw new Error('Unsupported expression type: ' + expression.type);

    return this.rules[expression.type].call(this, expression);

  }
}
