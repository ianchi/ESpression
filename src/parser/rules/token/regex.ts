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

// Error strings
const UNTERMINATED_ERROR = 'Unterminated Regular Expression';

/** Configuration object for RegExp Rule */
export interface IConfRegexRule {
  /** Valid regex flags. @default "gimuy" */
  flags?: string;
}

/**
 * Rule to parse regular expressions literals
 *
 * @see [[IConfRegexRule]]
 *
 * ## Syntax
 * ```
 * /pattern/flags
 * ```
 *
 * ## AST
 * The resulting AST node has the format:
 * ```
 * {
 *   "type": "Literal",
 *   "value": RegExp,
 *   "raw": string,
 *   "regex": {
 *       "pattern": string,
 *       "flags": string
 *    }
 * }
 * ```
 */
export class RegexRule extends BaseRule<IConfRegexRule> {
  constructor(config: IConfRegexRule = {}) {
    super();
    config.flags = config.flags || 'gimuy';
    this.config = config;
  }

  pre(ctx: ParserContext): INode | null {
    const start = ctx.i;

    // Regular expression literal must start with a slash
    if (!ctx.tyCh('/')) return null;

    let ch: string;
    let pattern = '';
    let bracket = false;
    let closed = false;
    let flags = '';
    let value: RegExp;

    // parse regex pattern
    while (!ctx.eof()) {
      // eslint-disable-next-line no-multi-assign
      pattern += ch = ctx.gbCh();
      if (ch === '\\') {
        if (ctx.teLT()) return ctx.err(UNTERMINATED_ERROR);
        pattern += ctx.gbCh();
      } else if (ctx.teLT()) return ctx.err(UNTERMINATED_ERROR);
      else if (bracket) {
        if (ch === ']') bracket = false;
      } else if (ch === '/') {
        closed = true;
        break;
      } else if (ch === '[') bracket = true;
    }

    if (!closed) return ctx.err(UNTERMINATED_ERROR);

    // remove trailing slash.
    pattern = pattern.substr(0, pattern.length - 1);

    // scan regex flags
    while (!ctx.eof() && this.config.flags && this.config.flags.indexOf(ctx.gtCh()) >= 0) {
      flags += ctx.gbCh();
    }

    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
      return ctx.err(e.message);
    }

    return {
      type: LITERAL_EXP,
      value,
      raw: ctx.e.substring(start, ctx.i),
      regex: { pattern, flags },
    };
  }
}
