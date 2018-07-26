/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { IPreResult } from '../../parser.interface';
import { BaseRule, Parser } from '../../parser';
import { ParserContext } from '../../context';
import { LITERAL_EXP, THIS_EXP, IDENTIFIER_EXP, NEW_EXP, CALL_EXP } from '../../presets/es5conf';

export type confIdentifierChars = {
  st?: { re?: RegExp, re2?: RegExp },
  pt?: { re?: RegExp, re2?: RegExp }
};
export type confIdentifierRule = {
  literals?: { [literal: string]: any },
  thisStr?: string,
  identifier?: confIdentifierChars,
  new?: { rules?: BaseRule[][], level?: number }
};

// Gobbles only identifiers
// e.g.: `foo`, `_value`, `$x1`
// Also, this function checks if that identifier is a literal:
// (e.g. `true`, `false`, `null`) or `this`
export class IdentifierRule extends BaseRule {

  newParser: Parser | undefined;
  constructor(public config: confIdentifierRule) {
    super();

    if (config.new && config.new.rules) this.newParser = new Parser(config.new.rules);
    if (!config.literals) config.literals = {};
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

    if (c.literals!.hasOwnProperty(identifier)) {
      return {
        node: {
          type: LITERAL_EXP,
          value: c.literals![identifier],
          raw: identifier
        }
      };
    } else if (identifier === c.thisStr) {
      return { node: { type: THIS_EXP } };
    } else if (c.new && identifier === 'new') {

      ctx.gbSp();
      const operand = this.newParser ? this.newParser.parse(ctx) : ctx.handler([c.new.level || 0, 0]);
      if (!operand) return ctx.err('Missing operand');

      return {
        node: {
          type: NEW_EXP,
          callee: operand && operand.type === CALL_EXP ? operand.callee : operand,
          arguments: operand && operand.type === CALL_EXP ? operand.arguments : []
        }
      };
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
