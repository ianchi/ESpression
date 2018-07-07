/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode, IPreResult } from './parser.interface';
import { ParserContext, IParser } from './context';
import { confIdentifierChars } from './rules/token/identifier';

export class Parser implements IParser {

  ops: { [type: string]: { maxLen: number, ops: { [op: string]: boolean } } } = {};

  config: any = {
    identifier: <confIdentifierChars> {
      st: { re: /[$_A-Za-z]/ },
      pt: { re: /[$_0-9A-Za-z]/ }
    }
  };
  constructor(public rules: BaseRule[][], config?: object) {
    if (!rules || !rules.length) throw new Error('Must provide rules');

    this.config = { ...this.config, ...config };

    for (let type of rules) {
      for (let rule of type) {
        rule.register(this);
      }
    }
  }

  registerOp(type: string, op: string, space: boolean) {
    if (!(type in this.ops)) this.ops[type] = { maxLen: 0, ops: {} };
    if (op in this.ops[type]) throw new Error('Duplicated rule for operator ' + op);

    this.ops[type].ops[op] = space;
    this.ops[type].maxLen = Math.max(this.ops[type].maxLen, op.length);
  }

  parse(expr: string | ParserContext): INode {
    let ctx: ParserContext, origParser: IParser = null;
    if (typeof expr === 'string') {
      ctx = new ParserContext(expr, this);
    } else {
      origParser = expr.parser;
      expr.parser = this;
      ctx = expr;
    }

    const node = this.runRules(ctx, [0, 0]);

    if (origParser) {
      ctx.parser = origParser;
    } else {
      ctx.gbSp();
      if (!ctx.eof()) ctx.err();
    }
    return node;
  }

  runRules(ctx: ParserContext, [type, from]: [number, number]): INode {
    const r = this.rules, oldHnd = ctx.hnd;

    if (from >= r[type].length) { type++; from = 0; }
    if (type >= r.length) return null;

    let res: INode = null, pre: IPreResult;

    if (type < r.length - 1) {
      ctx.hnd = [type, from];
      pre = r[type][from].pre(ctx);

      if (pre.final) {
        if (!pre.node) ctx.err();
        res = pre.node;
      } else {
        res = this.runRules(ctx, [type, from + 1]);
      }

      if (!pre.skip) {
        ctx.gbSp();
        res = r[type][from].post(ctx, pre.node, res);
      }
    } else {
      ctx.gbSp();
      for (let i = from; i < r[type].length; i++) {
        ctx.hnd = [type, i];
        pre = r[type][i].pre(ctx);
        if (pre && pre.node) break;
      }
      res = pre && pre.node;
    }

    ctx.hnd = oldHnd;
    return res;
  }

}
export class BaseRule {
  config = {};

  register(_parser: Parser) {} // tslint:disable-line:no-empty

  pre(_ctx: ParserContext): IPreResult {
    return { node: null };
  }

  post(_ctx: ParserContext, _preNode: INode, bubbledNode: INode) {
    return bubbledNode;
  }
}
