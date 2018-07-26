/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode, IPreResult } from '../../parser.interface';
import { BaseRule, Parser } from '../../parser';
import { ParserContext } from '../../context';

export type confArrayRule = { type: string, level?: number, parser?: Parser };

export class ArrayRule extends BaseRule {

  constructor(public config: confArrayRule) {
    super();

  }

  pre(ctx: ParserContext): IPreResult {

    let right: INode | null, multi: Array<INode | null> = [], i = 0, comma;

    if (!ctx.tyCh('[')) return { node: null };

    const c = this.config;

    do {
      if (c.parser) right = c.parser.parse(ctx);
      else right = ctx.handler([c.level || 0, 0]);

      ctx.gbSp();
      // tslint:disable-next-line:no-conditional-assignment
      if ((comma = ctx.tyCh(',')) || right) multi[i] = right;
      i++;
    } while (comma);

    if (!ctx.tyCh(']')) ctx.err();

    return {
      node: {
        type: c.type,
        elements: multi
      }
    };
  }

}
