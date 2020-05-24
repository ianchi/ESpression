/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser.interface';
import { ParserContext } from '../../parserContext';
import { BaseRule } from '../baseRule';
import { IExtraConf, ISubRuleConf } from '../conf.interface';

/**
 * Configuration object for a single unary expression
 */
export interface IConfTernaryRule extends ISubRuleConf, IExtraConf {
  /** AST node type for the unary expression */
  type: string;
  /** AST property name for the first's AST. @default "test" */
  first?: string;
  /** AST property name for the middle's AST. @default "consequent" */
  middle?: string;
  /** AST property name for the last's AST. @default "alternate" */
  last?: string;
  /**
   * String for the first operator (between `first` and `middle` operand)
   * @default "?"
   */
  firstOp?: string;
  /**
   * String for the second operator (between `middle` and `last` operand)
   * @default ":"
   */
  secondOp?: string;
}

/**
 * Rule to parse most expressions with three operands
 *
 * @remarks
 * This rules doesn't support evaluating with sub-rules.
 * All operands are evaluated using the current set and recursing from the current level
 *
 * @example
 * + first op1 middle op2 last `first ? middle : last`
 * @description The resulting AST node has the format:
 * ```
 * {
 *   "type": conf.type,
 *   [conf.first]: AST,
 *   [conf.middle]: string,
 *   [conf.last]: boolean,
 *   ... conf.extra
 * }
 * ```
 *
 */
export class TernaryOperatorRule extends BaseRule<IConfTernaryRule> {
  constructor(config: IConfTernaryRule) {
    super();

    this.config = {
      firstOp: '?',
      secondOp: ':',
      ...config,
    };
  }

  post(ctx: ParserContext, bubbledNode: INode): INode {
    const c = this.config;

    ctx.gbSp();
    if (!ctx.tyCh(c.firstOp!)) return bubbledNode;

    const consequent = ctx.parseNext(c.subRules || 0);

    ctx.gbSp();
    if (!ctx.tyCh(c.secondOp!)) return ctx.err(`Operator ${c.secondOp} expected, but found`);

    const alternate = ctx.parseNext(c.subRules || 0);

    return this.addExtra(
      c,
      {
        type: c.type,
        [c.first || 'test']: bubbledNode,
        [c.middle || 'consequent']: consequent,
        [c.last || 'alternate']: alternate,
      },
      ctx
    );
  }
}
