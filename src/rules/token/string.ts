/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { IPreResult } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';
import { LITERAL_EXP } from '../../presets/es5conf';

export type configStringRule = { LT: boolean, hex: boolean, raw: boolean };
export class StringRule extends BaseRule {

  constructor(public config: configStringRule = { LT: true, hex: true, raw: true }) {
    super();
  }

  pre(ctx: ParserContext): IPreResult {
    const c = this.config;
    let str = '', quote: string, closed = false, ch: string, start = ctx.pos;

    ch = ctx.gtCh();
    if (ch !== '"' && ch !== "'") return { node: null };
    quote = ctx.gbCh();

    while (!ctx.eof()) {
      ch = ctx.gbCh();
      if (ch === quote) {
        closed = true;
        break;
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
        ctx.err('Invalid line terminator in string');
      } else {
        str += ch;
      }
    }

    if (!closed) {
      ctx.err('Unclosed quote after ');
    }

    return {
      node: {
        type: LITERAL_EXP,
        value: str,
        raw: c.raw ? ctx.e.substring(start, ctx.pos) : quote + str + quote
      }
    };
  }
}
