/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode, IPreResult } from '../../parser.interface';
import { BaseRule, Parser } from '../../parser';
import { ParserContext } from '../../context';

export type confUnaryOp = {
  [operator: string]: { type: string, space?: boolean, types?: string[] }
};
export type confUnaryRule = {
  pre?: boolean,
  op: confUnaryOp
};

export class UnaryOperatorRule extends BaseRule {
  maxLen = 0;

  constructor(public config: confUnaryRule) {
    super();
    for (const op in config) {
      if (config.hasOwnProperty(op)) this.maxLen = op.length > this.maxLen ? op.length : this.maxLen;
    }
  }

  register(parser: Parser) {
    for (const op in this.config.op) {
      if (!this.config.op.hasOwnProperty(op)) continue;
      parser.registerOp('unary', op, !!this.config.op[op].space);
    }
  }

  pre(ctx: ParserContext): IPreResult {
    const c = this.config;
    if (!c.pre) return { node: null };

    const op = this.gobOperator(ctx);

    if (!op) return { skip: true, node: null };

    return {
      node: {
        type: c.op[op].type,
        operator: op,
        prefix: true
      }
    };
  }
  post(ctx: ParserContext, pre: INode, node: INode): INode {
    if (pre && !node) ctx.err();

    if (!pre) {
      const op = this.gobOperator(ctx);
      if (!op) return node;

      pre = {
        type: this.config.op[op].type,
        operator: op,
        prefix: false
      };
    }
    pre.argument = node;

    const types = this.config.op[pre.operator].types;
    if (types && types.indexOf(node.type) < 0) ctx.err('Invalid argument type');

    return pre;
  }

  gobOperator(ctx: ParserContext): string | null {
    ctx.gbSp();

    const op = ctx.gtOp('unary');

    if (op && this.config.op.hasOwnProperty(op)) {
      ctx.gb(op.length);
      return op;
    }
    return null;
  }
}
