/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { IPreResult } from '../../parser.interface';
import { BaseRule, Parser } from '../../parser';
import { ParserContext } from '../../context';
import { LITERAL_EXP, THIS_EXP, IDENTIFIER_EXP } from '../../presets/es5conf';

export type confIdentifierChars = {
  st?: { re?: RegExp, re2?: RegExp },
  pt?: { re?: RegExp, re2?: RegExp }
};
export type confIdentifierRule = {
  literals?: { [literal: string]: any },
  thisStr?: string,
  identifier?: confIdentifierChars
};

// Gobbles only identifiers
// e.g.: `foo`, `_value`, `$x1`
// Also, this function checks if that identifier is a literal:
// (e.g. `true`, `false`, `null`) or `this`
export class IdentifierRule extends BaseRule {

  constructor(public config: confIdentifierRule) {
    super();
  }

  register(parser: Parser) {

    const c = this.config.identifier,
      g = parser.config.identifier;
    if (c) {
      if (c.st) g.st = { ...g.st, ...c.st };
      if (c.pt) g.pt = { ...g.pt, ...c.pt };
    }
  }
  pre(ctx: ParserContext): IPreResult {

    const c = this.config;
    let identifier: string;

    if (!ctx.teIdSt()) return { node: null };
    identifier = ctx.gbCh();

    while (!ctx.eof()) {
      ctx.gtCh();
      if (!ctx.teIdPt()) break;
      identifier += ctx.gbCh();
    }

    if (c.literals.hasOwnProperty(identifier)) {
      return {
        node: {
          type: LITERAL_EXP,
          value: c.literals[identifier],
          raw: identifier
        }
      };
    } else if (identifier === c.thisStr) {
      return { node: { type: THIS_EXP } };
    } else {
      return {
        node: {
          type: IDENTIFIER_EXP,
          name: identifier
        }
      };
    }
  }
}
