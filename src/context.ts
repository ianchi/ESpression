import { INode } from './parser.interface';

export interface IParser {
  config: any;
  ops: { [type: string]: { maxLen: number, ops: { [op: string]: boolean } } };
  runRules(ctx: ParserContext, [type, from]: [number, number]): INode;
  parse(expr: string | ParserContext): INode;

}
export class ParserContext {

  hnd: [number, number] = [0, 0];

  sp = false;
  lt = false;

  get pos(): number { return this.i; }
  private i = 0;

  constructor(public e: string, public parser: IParser) { }

  rest(): string {
    return this.e.substr(this.i);
  }

  eof(): boolean {
    return this.i >= this.e.length;
  }
  gb(cant: number) {
    this.sp = this.lt = false;
    this.i += cant;
  }

  err(msg?: string) {
    throw new Error((msg || 'Unexpected char') + ' ' + this.gtCh() + ' at position ' + this.i);
  }

  teIdSt(): boolean {
    const ch = this.gtCh(), c = this.parser.config.identifier.st;
    return c.re.test(ch) || this.gtCd() >= 0x80 && (!c.re2 || c.re2.test(ch));
  }

  teIdPt(): boolean {
    const ch = this.gtCh(), c = this.parser.config.identifier.pt;
    return c.re.test(ch) || this.gtCd() >= 0x80 && (!c.re2 || c.re2.test(ch));
  }

  gbCh(): string {
    this.sp = this.lt = false;
    return this.e.charAt(this.i++);
  }
  gbCd(): number {
    this.sp = this.lt = false;
    return this.e.charCodeAt(this.i++);
  }

  gtCh(offset?: number): string {
    return this.e.charAt(this.i + (offset || 0));
  }
  gtCd(offset?: number): number {
    return this.e.charCodeAt(this.i + (offset || 0));
  }

  teCh(ch: string): boolean {
    return ch === this.e.charAt(this.i);
  }

  tyCh(ch: string): boolean {
    if (!this.teCh(ch)) return false;
    this.sp = this.lt = false;
    this.i++;
    return true;
  }

  gbSp(): boolean {
    let sp, lt;
    // space or tab
    // tslint:disable-next-line:no-conditional-assignment
    while ((sp = this.teSP()) || (lt = this.teLT())) {
      this.i++;
      this.sp = this.sp || sp;
      this.lt = this.lt || lt;
    }
    return this.sp || this.lt;
  }

  teSP(offset?: number) {
    const ch = this.gtCd(offset);
    return ch === 32 || ch === 9;

  }

  teLT(offset?: number) {
    const ch = this.gtCd(offset);
    return ch === 10 || ch === 13;

  }

  gbHex(prefix: string): string {
    const len = (prefix === 'u') ? 4 : 2;
    let code = 0, digit: number;
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
  gtOp(type: string): string {

    const ops = this.parser.ops[type];
    if (!ops) return null;
    let toCheck = this.e.substr(this.i, ops.maxLen), tcLen = toCheck.length;
    while (tcLen > 0) {
      if (toCheck in ops.ops) {
        if (!ops.ops[toCheck] || this.teSP(tcLen) || this.teLT(tcLen)) {
          return toCheck;
        }
      }
      toCheck = toCheck.substr(0, --tcLen);
    }
    return null;
  }

  handleUp(): INode {
    return this.parser.runRules(this, [this.hnd[0], this.hnd[1] + 1]);
  }

  recurse(): INode {
    return this.parser.runRules(this, this.hnd);
  }

  handler(level: [number, number]): INode {
    return this.parser.runRules(this, level);
  }
}
