import { IPreResult } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';

// Error strings
const UNTERMINATED_ERROR = 'Unterminated Regular Expression';

export class RegexRule extends BaseRule {

  pre(ctx: ParserContext): IPreResult {
    const start = ctx.pos;

    // Regular expression literal must start with a slash
    if (!ctx.tyCh('/')) return null;

    let ch: string, pattern = '', bracket = false, closed = false;
    let flags = '', value: RegExp;

    // parse regex pattern
    while (!ctx.eof()) {
      pattern += ch = ctx.gbCh();
      if (ch === '\\') {
        if (ctx.teLT()) ctx.err(UNTERMINATED_ERROR);
        pattern += ctx.gbCh();
      } else if (ctx.teLT()) ctx.err(UNTERMINATED_ERROR);
      else if (bracket) {
        if (ch === ']') bracket = false;
      } else if (ch === '/') {
        closed = true;
        break;
      } else if (ch === '[') bracket = true;

    }

    if (!closed) ctx.err(UNTERMINATED_ERROR);

    // remove trailing slash.
    pattern = pattern.substr(0, pattern.length - 1);

    // scan regex flags
    while (!ctx.eof() && ctx.teIdPt()) {
      flags = ctx.gbCh();
    }

    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
      ctx.err(e.message);
    }

    return {
      node: {
        type: 'Literal',
        value: value,
        raw: ctx.e.substring(start, ctx.pos),
        regex: {
          pattern: pattern,
          flags: flags
        }
      }
    };
  }
}
