/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser.interface';
import { ParserContext } from '../../parserContext';
import { LITERAL_EXP, TEMPLATE_ELE, TEMPLATE_EXP } from '../../presets/const';
import { BaseRule } from '../baseRule';
import { ISubRuleConf } from '../conf.interface';

/** Configuration object for String Rule */
export interface IConfStringRule extends ISubRuleConf {
  /** Allow line continuation (escaped CR|LF). Always true for templates */
  LT?: boolean;
  /** Allow hex scape sequences */
  hex?: boolean;
  /**
   * Parse unquoted text string:
   * if `undefined`, needs a starting quote to match rule
   * if `true` matches everything till eof
   * if `false` and `templateRules` no starting quote, but expects closing backtick char (used for tagged templates).
   */
  unquoted?: boolean;
  /**
   * Label to jump to parse template expressions
   * If not set, it doesn't match template expressions
   */
  templateRules?: string;
  /**
   * For string literals, include pure raw string in AST's `raw` node.
   * If false include cooked string between quotes.
   */
  raw?: boolean;

  /**
   * For string literals include a map of positions and length of
   * escape sequences, to allow to map from raw to cooked.
   *
   * It adds an `escapes: IPosition[]` property to the parsed node
   * with an array of the positions and length of the raw escape
   * sequences.
   *
   */
  escapes?: boolean;
}

/**
 * Rule to parse string literals and template literals
 *
 * @see [[IConfStringRule]]
 *
 * ## AST
 * The resulting AST node has the format:
 *
 * ### String Literals
 * ```
 * {
 *   "type": "Literal",
 *   "value": string,
 *   "raw": string
 * }
 * ```
 *
 * ### Template Literals
 * ```
 * {
 *   "type": "TemplateLiteral",
 *   "quasis": templateElement[],
 *   "expressions": AST[]
 * }
 * ```
 * Where `templateElement` has the form:
 * ```
 * {
 *    "type": "TemplateElement",
 *    "value": {
 *      "cooked": string,
 *      "raw": string
 *    },
 *    "tail": boolean
 * }
 * ```
 */

export interface IPosition {
  offset: number;
  length: number;
}
export class StringRule extends BaseRule<IConfStringRule> {
  constructor(public config: IConfStringRule = { LT: true, hex: true, raw: true }) {
    super();
  }

  pre(ctx: ParserContext): INode | null {
    const c = this.config;
    let str = '',
      quote = c.unquoted === false && c.templateRules ? '`' : '',
      closed = false,
      ch: string | null,
      start = ctx.i,
      isTemplate = false,
      LT = c.LT;
    const expressions = [],
      quasis = [],
      escapes: IPosition[] = [];

    // check for string start marker
    if (typeof c.unquoted === 'undefined') {
      ch = ctx.gtCh();

      if (c.templateRules && ch === '`') {
        isTemplate = true;
        LT = true;
        start++;
      } else if (ch !== '"' && ch !== "'") return null;
      quote = ctx.gbCh();
    } else if (c.templateRules) {
      isTemplate = true;
      LT = true;
    }

    while (!ctx.eof()) {
      ch = ctx.gbCh();
      if (ch === quote) {
        closed = true;
        if (isTemplate) {
          quasis.push({
            type: TEMPLATE_ELE,
            value: {
              cooked: str,
              raw: ctx.e.substring(start, ctx.i - 1),
            },
            tail: true,
            ...(ctx.config.range ? { range: [start, ctx.i - 1] } : {}),
          });
        }
        break;
      } else if (isTemplate && ch === '$' && ctx.tyCh('{')) {
        quasis.push({
          type: TEMPLATE_ELE,
          value: {
            cooked: str,
            raw: ctx.e.substring(start, ctx.i - 2),
          },
          tail: false,
          ...(ctx.config.range ? { range: [start, ctx.i - 2] } : {}),
        });
        str = '';
        expressions.push(ctx.parseNext(c.templateRules!));
        ctx.gbSp();
        if (!ctx.tyCh('}')) return ctx.err('Expected "}" but found ');
        start = ctx.i;
      } else if (ch === '\\') {
        const init = ctx.i - 1;

        if (LT && ctx.teLT()) {
          // check for line continuation
          ch = ctx.gbCh();
          if (ch === '\r') ctx.tyCh('\n');
        } else {
          ch = ctx.gbCh();

          switch (ch) {
            // check for common escapes
            case 'n':
              str += '\n';
              break;
            case 'r':
              str += '\r';
              break;
            case 't':
              str += '\t';
              break;
            case 'b':
              str += '\b';
              break;
            case 'f':
              str += '\f';
              break;
            case 'v':
              str += '\x0B';
              break;

            // check for hex
            case 'u':
            case 'x':
              if (c.hex) {
                ch = ctx.gbHex(ch);
                if (ch === null) return ctx.err('Hexadecimal digit expected');
              }
              str += ch;
              break;
            default:
              str += ch;
          }
        }
        escapes.push({ offset: init, length: ctx.i - init });
      } else if (c.LT && ctx.teLT(-1)) {
        if (!isTemplate) return ctx.err('Invalid line terminator in string');
        if (ch === '\r') ctx.tyCh('\n');
        str += '\n';
      } else {
        str += ch;
      }
    }

    if (!closed && !c.unquoted) {
      ctx.err('Unclosed quote after ');
    }

    if (isTemplate) return { type: TEMPLATE_EXP, quasis, expressions };
    else {
      const ret: INode = {
        type: LITERAL_EXP,
        value: str,
        raw: c.raw ? ctx.e.substring(start, ctx.i) : quote + str + quote,
      };

      if (c.escapes) ret.escapes = escapes;
      return ret;
    }
  }
}

/**
 * Converts cooked position offset to raw position in string
 */

export function toRawPosition(node: INode, pos: number): number {
  let offset = 0;

  if (!node || !node.escapes || node.type !== LITERAL_EXP) return pos;

  for (const n of node.escapes) {
    if (n.offset < pos + offset) offset += n.length - 1;
    else break;
  }
  return pos + offset;
}
