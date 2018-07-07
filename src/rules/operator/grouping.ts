/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode, IPreResult } from '../../parser.interface';
import { BaseRule, Parser } from '../../parser';
import { ParserContext } from '../../context';

export type confGroupingRule = {
  type?: string, prop?: string,
  open: string, close: string,
  level?: number, rules?: BaseRule[][]
};
export class GroupingOperatorRule extends BaseRule {
  parser: Parser;
  level: number = 0;

  constructor(public config: confGroupingRule) {
    super();
    if (typeof config.level === 'number') this.level = config.level;
    else this.parser = new Parser(config.rules);
  }

  register(parser: Parser) {
    parser.registerOp('group', this.config.open, false);
  }
  pre(ctx: ParserContext): IPreResult {

    const c = this.config;
    let node: INode;

    ctx.gbSp();

    if (ctx.gtOp('group') !== c.open) return { node: null };
    ctx.gb(c.open.length);

    if (this.parser) node = this.parser.parse(ctx);
    else node = ctx.handler([this.level, 0]);

    if (!node) ctx.err();
    ctx.gbSp();
    if (!ctx.tyCh(c.close)) ctx.err();

    if (c.type && c.prop) {
      node = {
        type: c.type,
        [c.prop]: node
      };
    }

    return {
      final: true,
      node: node
    };
  }
}
