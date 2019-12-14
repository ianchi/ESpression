/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { ParseError } from './parseError';
import { ICharClass, INode, IOperatorDef, IParserConfig } from './parser.interface';
import { IMultiConf } from './rules/conf.interface';

// define BaseRule as interface to avoid circular references between files only for typedef

export interface IRule {
  register(): IOperatorDef;
  pre(ctx: ParserContext): INode | null;
  post(ctx: ParserContext, bubbledNode: INode): INode;
}

export interface IRuleSet {
  [branch: string]: Array<IRule | string>;
}
export class ParserContext {
  sp = false;
  lt = false;

  i = 0;

  private branch = '';
  private level = 0;
  private nxtOp = '';
  private opPos = -1;
  constructor(public e: string, public rules: IRuleSet, public config: IParserConfig) { }

  rest(): string {
    return this.e.substr(this.i);
  }

  eof(): boolean {
    return this.i >= this.e.length;
  }
  gb(cant: number): void {
    if (!cant) return;
    this.sp = this.lt = false;
    this.i += cant;
  }

  /**
   * Throws a SyntaxError for problems detected on parsing.
   * @param noMatch If `true` marks that no rule matched, otherwise it matched but with errors
   * When throwing from inside a rule, this should not be set.
   */
  err(msg?: string, noMatch?: boolean): never {
    throw new ParseError(msg || 'Unexpected char', this.e, this.i, !!noMatch);
  }

  teIdSt(chars?: ICharClass): boolean {
    const ch = this.gtCh();
    chars = { ...this.config.identStart, ...chars };
    return !!(
      (chars.re && chars.re.test(ch)) ||
      (this.gtCd() >= 0x80 && (!chars.re2 || chars.re2.test(ch)))
    );
  }

  teIdPt(chars?: ICharClass): boolean {
    const ch = this.gtCh();
    chars = { ...this.config.identPart, ...chars };
    return !!(
      (chars.re && chars.re.test(ch)) ||
      (this.gtCd() >= 0x80 && (!chars.re2 || chars.re2.test(ch)))
    );
  }

  gbCh(): string {
    this.sp = this.lt = false;
    return this.e.charAt(this.i++);
  }

  gtCh(offset?: number): string {
    return this.e.charAt(this.i + (offset || 0));
  }
  gtCd(offset?: number): number {
    return this.e.charCodeAt(this.i + (offset || 0));
  }

  tyCh(ch: string): boolean {
    if (ch !== this.e.charAt(this.i)) return false;
    this.sp = this.lt = false;
    this.i++;
    return true;
  }

  gbSp(): boolean {
    let sp = false,
      lt = false;
    // space or tab
    // tslint:disable-next-line:no-conditional-assignment
    while (!this.eof() && ((sp = this.teSP()) || (lt = this.teLT()))) {
      this.i++;
      this.sp = this.sp || sp;
      this.lt = this.lt || lt;
    }
    return this.sp || this.lt;
  }

  /**
   * Test if the character is a space or tab character (ASCII 32 | 9)
   * @param offset If set test character at `offset` of current position
   */
  teSP(offset?: number): boolean {
    const ch = this.gtCd(offset);
    return ch === 32 || ch === 9;
  }

  teLT(offset?: number): boolean {
    const ch = this.gtCd(offset);
    return ch === 10 || ch === 13;
  }

  gbHex(prefix: string): string | null {
    const len = prefix === 'u' ? 4 : 2;
    let code = 0,
      digit: number;
    const hexDigit = '0123456789abcdef';

    for (let i = 0; i < len; ++i) {
      digit = hexDigit.indexOf(this.gtCh().toLowerCase());
      if (!this.eof() && digit >= 0) {
        this.i++;
        code = code * 16 + digit;
      } else return null;
    }
    return String.fromCharCode(code);
  }
  gtOp(): string | null {
    // cache result
    if (this.nxtOp && this.opPos === this.i) return this.nxtOp;
    const ops = this.config.ops;
    let toCheck = this.e.substr(this.i, this.config.maxOpLen),
      tcLen = toCheck.length;
    while (tcLen > 0) {
      if (toCheck in ops) {
        if (
          !ops[toCheck] ||
          this.teSP(tcLen) ||
          this.teLT(tcLen) ||
          this.i + tcLen >= this.e.length
        ) {
          this.nxtOp = toCheck;
          this.opPos = this.i;
          return toCheck;
        }
      }
      toCheck = toCheck.substr(0, --tcLen);
    }
    return null;
  }

  gbOp(restrict: object): string | null {
    this.gbSp();

    const op = this.gtOp();

    if (op && op in restrict) {
      this.gb(op.length);
      return op;
    }
    return null;
  }

  tySep(separators?: string): boolean | string {
    const ch = this.gtCh();
    if (!separators) return false;
    if (ch && separators.indexOf(ch) >= 0) {
      this.gbCh();
      return ch;
    } else if (
      (this.sp && separators.indexOf(' ') >= 0) ||
      ((this.lt || this.eof()) && separators.indexOf('\n') >= 0)
    )
      return true;

    return separators.indexOf('\0') >= 0;
  }

  /**
   * Perform the actual parsing. It is done in two stages:
   *
   * ## 1: Pre Parse - Bottom up operators
   * First all operators' rules are called from the lowest to the highiest invoking its `pre` hook.
   * If any rule detects a match it can stop the bubbling up if it completely parses the expression,
   * or just pass some pre-parse information to the next phase
   *
   * ## 2: Pre Parse - Literals
   * Then the last level (literals) is invoked.
   *
   * @remark If no rule matches throw an `Error`
   *
   * ## Post Parse - Top Down operators
   * Once the first expression has been parsed, traverse down the operators level, passing the pre-parse information
   * and the parsed node.
   * The rules should complete the parsing of the remainder expressions, triggering subparses for the next operands
   *
   * @remark If the string has not been complete consumed, throw an `Error`
   */
  parseNext(jump: string | number): INode {
    const curBranch = this.branch,
      curLevel = this.level,
      curPos = this.i;
    let res: INode;

    try {
      const rule = this.moveRule(jump);

      res = rule.pre(this) || this.parseNext(1);

      this.gbSp();
      res = rule.post(this, res);
      if (this.config.range) res.range = [curPos, this.i];
      return res;
    } finally {
      this.branch = curBranch;
      this.level = curLevel;
    }
  }

  private moveRule(jump: string | number = 0): IRule {
    if (typeof jump === 'string') {
      if (!(jump in this.rules)) throw new Error(`No registered label ${jump}`);
      this.branch = jump;
      this.level = 0;
    } else if (jump === 1) this.level++;

    const rules = this.rules[this.branch];

    if (this.level >= rules.length) throw this.err('No matching rule', true);

    const rule = rules[this.level];
    return typeof rule === 'string' ? this.moveRule(rule) : rule;
  }

  parseMulti(c: IMultiConf, jump: string | number): Array<INode | null> & { match?: boolean } {
    const nodes: Array<INode | null> & { match?: boolean } = [];
    let sep: boolean | string,
      node: INode,
      index = 0;

    do {
      this.gbSp();

      try {
        node = this.parseNext(jump);

        nodes[index] = node;
        sep = this.tySep(c.separators);
        if (c.types && (sep || !c.separators) && c.types.indexOf(node.type) < 0)
          return this.err('Invalid argument type');
      } catch (e) {
        // use instanceof "SyntaxError" as transpiled code looses the reference to ParseError
        if (e instanceof SyntaxError && (<ParseError>e).noMatch) {
          // no expression found

          sep = this.tySep(c.separators);

          if (!sep || sep === true) {
            // empty last expression

            if (!c.trailling && index > 0) return this.err('Expected expression');
            if (index > 0) sep = true;
            break;

            // sparse
          } else if (!c.sparse) return this.err('Expected expression');
          else nodes[index] = c.sparse !== true ? c.sparse : null;
        } else throw e;
      }

      index++;
    } while (sep && !this.eof() && index <= c.maxSep!);

    if (
      (sep && !nodes.length) ||
      (nodes.length === 1 && (sep || !c.separators)) ||
      nodes.length > 1
    )
      nodes.match = true;
    return nodes;
  }
}
