/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { IPreResult } from '../../parser.interface';
import { BaseRule, Parser } from '../../parser';
import { ParserContext } from '../../context';
import { LITERAL_EXP, TEMPLATE_EXP, TEMPLATE_ELE } from '../../presets/es5conf';

export type configStringRule = {
  LT: boolean, hex: boolean, raw: boolean,
  templateRule?: { rules?: BaseRule[][], level?: number }
};
export class StringRule extends BaseRule {

  exprRules: Parser | undefined;

  constructor(public config: configStringRule = { LT: true, hex: true, raw: true }) {
    super();

    if (config.templateRule) {
      if (config.templateRule.rules) this.exprRules = new Parser(config.templateRule.rules);
      else if (!config.templateRule.level) throw new Error('Missing "level" or "rules" property');
    }
  }

  pre(ctx: ParserContext): IPreResult {
    const c = this.config;
    let str = '', quote: string, closed = false, ch: string | null, start = ctx.pos, isTemplate = false;
    const expressions = [], quasis = [];

    ch = ctx.gtCh();
    if (ch === '`' && c.templateRule) {
      isTemplate = true;
      c.LT = true;
      start++;
    } else if (ch !== '"' && ch !== "'") return { node: null };
    quote = ctx.gbCh();

    while (!ctx.eof()) {
      ch = ctx.gbCh();
      if (ch === quote) {
        closed = true;
        if (isTemplate) {
          quasis.push({
            type: TEMPLATE_ELE,
            value: {
              cooked: str,
              raw: ctx.e.substring(start, ctx.pos - 1)
            },
            tail: true
          });
        }
        break;
      } else if (isTemplate && ch === '$' && ctx.tyCh('{')) {
        quasis.push({
          type: TEMPLATE_ELE,
          value: {
            cooked: str,
            raw: ctx.e.substring(start, ctx.pos - 2)
          },
          tail: false
        });
        str = '';
        expressions.push(this.exprRules ? this.exprRules.parse(ctx) : ctx.handler([c.templateRule!.level || 0, 0]));
        ctx.gbSp();
        if (!ctx.tyCh('}')) ctx.err('Unclosed "}" after ');
        start = ctx.pos;

      } else if (ch === '\\') {

        if (c.LT && ctx.teLT()) {
          // check for line continuation
          ch = ctx.gbCh();
          if (ch === '\r') ctx.tyCh('\n');
        } else {
          ch = ctx.gbCh();

          switch (ch) {
            // check for common escapes
            case 'n': str += '\n'; break;
            case 'r': str += '\r'; break;
            case 't': str += '\t'; break;
            case 'b': str += '\b'; break;
            case 'f': str += '\f'; break;
            case 'v': str += '\x0B'; break;

            // check for hex
            case 'u':
            case 'x':
              if (c.hex) {
                ch = ctx.gbHex(ch);
                if (ch === null) ctx.err('Invalid Hex Escape');
              }
              str += ch;
              break;
            default: str += ch;
          }
        }
      } else if (c.LT && ctx.teLT(-1)) {
        if (!isTemplate) ctx.err('Invalid line terminator in string');
        if (ch === '\r') ctx.tyCh('\n');
        str += '\n';
      } else {
        str += ch;
      }
    }

    if (!closed) {
      ctx.err('Unclosed quote after ');
    }

    return isTemplate ?
      {
        node: {
          type: TEMPLATE_EXP,
          quasis: quasis,
          expressions: expressions
        }
      } :
      {
        node: {
          type: LITERAL_EXP,
          value: str,
          raw: c.raw ? ctx.e.substring(start, ctx.pos) : quote + str + quote
        }
      };
  }
}
