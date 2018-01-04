import { IPreResult } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';

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
    let ch: string, identifier: string;

    if (!ctx.teIdSt()) return { node: null };
    identifier = ctx.gbCh();

    while (!ctx.eof()) {
      ch = ctx.gtCh();
      if (!ctx.teIdPt()) break;
      identifier += ctx.gbCh();
    }

    if (c.literals.hasOwnProperty(identifier)) {
      return {
        node: {
          type: 'Literal',
          value: c.literals[identifier],
          raw: identifier
        }
      };
    } else if (identifier === c.thisStr) {
      return { node: { type: 'ThisExpression' } };
    } else {
      return {
        node: {
          type: 'Identifier',
          name: identifier
        }
      };
    }
  }
}
