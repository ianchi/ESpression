/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser.interface';
import { ParserContext } from '../../parserContext';
import { LITERAL_EXP } from '../../presets/const';
import { BaseRule } from '../baseRule';

export interface IConfNumberRule {
  /** Numeric base, must be between 2-36 */
  radix: number;

  /**
   * Regex pattern with start prefix marking the number. Case insensitive.
   * If not set, matchs any number starting with a digit in the radix range
   * @example `0x` `0o`
   */
  prefix?: string;
  /** Allow decimal number, only for base 10  */
  decimal?: boolean;
  /** Allow exponencial notation, only for base 10 */
  exp?: boolean;
}
/**
 * Rule to parse number literals
 *
 * @see [[IConfNumberRule]]
 *
 * ## Syntax
 * ### General Case
 * ```
 * prefix number exp number
 * ```
 *
 * @example
 * `123.45` `0xAF`
 * `0o17`
 *
 *
 * ## AST
 * The resulting AST node has the format:
 * ```
 * {
 *   "type": "Literal",
 *   "value": number,
 *   "raw": string
 * }
 * ```
 */
export class NumberRule extends BaseRule<IConfNumberRule> {
  digits: RegExp;
  prefix: RegExp | undefined;

  constructor(public config: IConfNumberRule = { radix: 10, decimal: true, exp: true }) {
    super();
    // tslint:disable:no-magic-numbers
    if (config.radix < 2 || config.radix > 36) throw new RangeError('Radix out of range');
    let digits = '0-' + (config.radix < 10 ? config.radix - 1 : 9);
    if (config.radix > 10) digits += 'A-' + String.fromCharCode(64 + config.radix - 10);
    if (config.radix !== 10) {
      config.decimal = false;
      config.exp = false;
    }

    this.digits = new RegExp('[' + digits + ']', 'i');
    if (config.prefix) this.prefix = new RegExp('^' + config.prefix, 'i');

    // tslint:enable:no-magic-numbers
  }

  pre(ctx: ParserContext): INode | null {
    const c = this.config;

    let num = '',
      ch,
      prefix = '';

    if (this.prefix) {
      const m = this.prefix.exec(ctx.rest());
      if (!m) return null;
      prefix = m[0];
      ctx.gb(prefix.length);
    }

    while (this.digits.test(ctx.gtCh())) {
      num += ctx.gbCh();
    }

    if (c.decimal && ctx.gtCh() === '.') {
      // can start with a decimal marker

      num += ctx.gbCh();

      while (this.digits.test(ctx.gtCh())) {
        num += ctx.gbCh();
      }
    }

    if ((!num || num === '.') && !prefix) {
      ctx.gb(-num.length);
      return null;
    }

    ch = ctx.gtCh();
    if (c.exp && (ch === 'e' || ch === 'E')) {
      // exponent marker
      num += ctx.gbCh();
      ch = ctx.gtCh();
      if (ch === '+' || ch === '-') {
        // exponent sign
        num += ctx.gbCh();
      }
      while (this.digits.test(ctx.gtCh())) {
        // exponent itself
        num += ctx.gbCh();
      }
      if (!this.digits.test(ctx.gtCh(-1))) {
        ctx.err('Expected exponent (' + num + ctx.gtCh() + ')');
      }
    }

    if (!num.length) return ctx.err('Invalid number format');

    if (ctx.teIdSt()) return ctx.err();

    return {
      type: LITERAL_EXP,
      value: c.decimal ? parseFloat(num) : parseInt(num, c.radix),
      raw: prefix + num,
    };
  }
}
