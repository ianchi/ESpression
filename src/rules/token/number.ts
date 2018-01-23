import { IPreResult } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';
import { LITERAL_EXP } from '../../presets/es5conf';

export type configNumberRule = { radix: number; prefix?: RegExp; int?: boolean; noexp?: boolean; };
export class NumberRule extends BaseRule {
  digits: RegExp;

  constructor(public config: configNumberRule = { radix: 10, prefix: null, int: false, noexp: false }) {
    super();
    if (config.radix < 2 || config.radix > 36) throw new Error('Radix out of range');
    let digits = '0-' + (config.radix < 10 ? config.radix - 1 : 9);
    if (config.radix > 10) digits += 'A-' + String.fromCharCode(64 + config.radix - 10);
    if (config.radix !== 10) {
      config.int = true;
      config.noexp = true;
    }

    this.digits = new RegExp('[' + digits + ']', 'i');

  }

  pre(ctx: ParserContext): IPreResult {
    let c = this.config;

    let num = '', ch, prefix = '';

    if (c.prefix) {
      let m = c.prefix.exec(ctx.rest());
      if (!m) return null;
      prefix = m[0];
      ctx.gb(prefix.length);
    }

    while (this.digits.test(ctx.gtCh())) {
      num += ctx.gbCh();
    }

    if (!c.int && ctx.gtCh() === '.') { // can start with a decimal marker

      num += ctx.gbCh();

      while (this.digits.test(ctx.gtCh())) {
        num += ctx.gbCh();
      }

    }

    if ((!num || num === '.') && !prefix) {
      ctx.gb(- num.length);
      return { node: null };
    }

    ch = ctx.gtCh();
    if (!c.noexp && (ch === 'e' || ch === 'E')) { // exponent marker
      num += ctx.gbCh();
      ch = ctx.gtCh();
      if (ch === '+' || ch === '-') { // exponent sign
        num += ctx.gbCh();
      }
      while (this.digits.test(ctx.gtCh())) { // exponent itself
        num += ctx.gbCh();
      }
      if (!this.digits.test(ctx.gtCh(-1))) {
        ctx.err('Expected exponent (' + num + ctx.gtCh() + ')');
      }
    }

    if (!num.length) ctx.err('Invalid number format');

    if (ctx.teIdSt()) ctx.err();

    return {
      node: {
        type: LITERAL_EXP,
        value: c.int ? parseInt(num, c.radix) : parseFloat(num),
        raw: prefix + num
      }
    };
  }
}
