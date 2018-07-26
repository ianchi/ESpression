/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';

export type confTernaryRule = {
  type: string,
  firstOp: string, secondOp: string,
  left: string, middle: string, right: string
};
export class TernaryOperatorRule extends BaseRule {

  constructor(public config: confTernaryRule) {
    super();
  }

  post(ctx: ParserContext, _preNode: INode, bubbledNode: INode): INode {
    const c = this.config;

    ctx.gbSp();

    if (!ctx.tyCh(c.firstOp)) return bubbledNode;

    const consequent = ctx.recurse();

    ctx.gbSp();

    if (!ctx.tyCh(c.secondOp) || !consequent) ctx.err();

    const alternate = ctx.recurse();

    if (!alternate) ctx.err();

    const node: INode = { type: c.type };
    node[c.left] = bubbledNode;
    node[c.middle] = consequent;
    node[c.right] = alternate;

    return node;
  }
}
