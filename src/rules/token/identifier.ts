import { IPreResult } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';
import { LITERAL_EXP, THIS_EXP, IDENTIFIER_EXP } from '../../presets/es5conf';

export type confIdentifierRule = { literals?: { [literal: string]: any }, thisStr?: string };

// Gobbles only identifiers
// e.g.: `foo`, `_value`, `$x1`
// Also, this function checks if that identifier is a literal:
// (e.g. `true`, `false`, `null`) or `this`
export class IdentifierRule extends BaseRule {

  constructor(public config: confIdentifierRule = {
    literals: {
      'true': true,
      'false': false,
      'null': null
    },
    thisStr: 'this'
  }) {
    super();
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
