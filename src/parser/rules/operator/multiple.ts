/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser.interface';
import { ParserContext, IExtraConf } from '../../parserContext';
import { EXPRESSION } from '../../presets/const';
import { BaseRule } from '../baseRule';
import { IMultiConf, ISubRuleConf } from '../conf.interface';

/**
 * Configuration object for a multi expression
 */
export interface IConfMultipleRule extends IMultiConf, ISubRuleConf, IExtraConf {
  /** AST node type for the binary expression */
  type: string;
  /** AST property name for the expression's AST. @default "expression" */
  prop?: string;

  empty?: boolean;
}

/**
 * Rule to parse multiple expressions and wrap them in an AST node
 *
 * @remarks
 * This rule can optionally be run without any operator, in this mode it is used
 * as a wrapper for the inner AST
 *
 * @see [[IConfMultipleRule]]
 * @example
 * + expr op expr op expr `a, b, c`
 * @description The resulting AST node has the format:
 * ```
 * {
 *   "type": conf.type,
 *   [conf.prop]: AST[] | AST, // single node if !separators or maxSep===0
 *   ... conf.extra
 * }
 * ```
 */
export class MultiOperatorRule extends BaseRule<IConfMultipleRule> {
  constructor(public config: IConfMultipleRule) {
    super();
    config.prop = config.prop || EXPRESSION;
    this.unwrapMulti(config);
  }

  pre(ctx: ParserContext): INode | null {
    // use pre to be able to check for empty expression on first slot
    const curPos = ctx.i;
    const c = this.config;
    const nodes = ctx.parseMulti(c, c.subRules || 1);

    // no match
    if (!nodes.match) return nodes.length ? nodes[0] : null;

    // delete non standard property to keep AST equality
    delete nodes.match;

    if (!nodes.length && (!c.empty || !c.separators)) return ctx.err('Expression expected');

    const ret = this.addExtra(
      c,
      {
        type: c.type,
        [c.prop!]: c.separators ? nodes : nodes[0],
      },
      ctx
    );

    if (ctx.config.range) ret.range = [curPos, ctx.eof() && !ctx.lt ? ctx.ch : ctx.i];
    return ret;
  }
}
