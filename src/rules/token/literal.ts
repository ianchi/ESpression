/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { IPreResult, INode } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';

export type confLiteralRule = {
  type: string, prop?: string,
  start?: string, part?: string,
  literals: { [literal: string]: any },
  value?: string
};

// Gobbles only identifiers
// e.g.: `foo`, `_value`, `$x1`
// Also, this function checks if that identifier is a literal:
// (e.g. `true`, `false`, `null`) or `this`
export class LiteralRule extends BaseRule {

  constructor(public config: confLiteralRule) {
    super();

  }

  pre(ctx: ParserContext): IPreResult {

    const c = this.config;
    let identifier: string, node: INode;

    if (!ctx.teIdSt() && (!c.start || c.start.indexOf(ctx.gtCh()) < 0)) return { node: null };
    identifier = ctx.gbCh();

    while (!ctx.eof()) {
      if (!ctx.teIdPt() && (!c.part || c.part.indexOf(ctx.gtCh()) < 0)) break;
      identifier += ctx.gbCh();
    }

    node = { type: c.type };
    if (c.prop) node[c.prop] = identifier;

    if (c.literals) {
      if (c.literals.hasOwnProperty(identifier)) {
        if (c.value) node[c.value] = c.literals[identifier];

      } else return null;
    }

    return { node: node };
  }
}
