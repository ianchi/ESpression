import { INode } from '../../parser.interface';
import { BaseRule, Parser } from '../../parser';
import { ParserContext } from '../../context';

export type confBinaryRule = {
  [operator: string]: {
    type: string,
    rasoc?: boolean,
    space?: boolean,
    left?: string, right?: string, close?: string,
    noop?: boolean, extra?: object,

    multi?: string, empty?: boolean,
    level?: number, parser?: Parser, rules?: BaseRule[][]
  }
};
export class BinaryOperatorRule extends BaseRule {
  maxLen = 0;

  constructor(public config: confBinaryRule) {
    super();
    let c;

    for (const op in config) {
      c = config[op];

      this.maxLen = Math.max(op.length, this.maxLen);
      c.left = c.left || 'left';
      c.right = c.right || 'right';
      c.empty = c.close && c.empty || false;
      c.multi = c.close && c.multi || '';
      if (c.rules && !c.parser) c.parser = new Parser(c.rules);
    }
  }

  register(parser: Parser) {
    for (const op in this.config) {
      parser.registerOp('binary', op, this.config[op].space);
    }
  }

  post(ctx: ParserContext, preNode: INode, bubbledNode: INode): INode {

    let right: INode, multi: INode[] = [], node: INode, nxt = false,
      op = this.gbOp(ctx),
      c = this.config[op];

    if (!op) return bubbledNode;

    do {
      do {

        if (c.parser) right = c.parser.parse(ctx);
        else if (c.level) right = ctx.handler([c.level, 0]);
        else if (c.rasoc) right = ctx.recurse();
        else right = ctx.handleUp();

        if (!right && !c.empty) ctx.err('Missing right opperand. Found');

        ctx.gbSp();

        if (right && c.multi) multi.push(right);
        // tslint:disable-next-line:no-conditional-assignment
        if (!(nxt = c.multi && right && ctx.tyCh(c.multi)) && c.close && !ctx.tyCh(c.close)) ctx.err();
      }
      while (nxt);

      node = { type: c.type };
      if (!c.noop) node.operator = op;
      node[c.left] = bubbledNode;
      node[c.right] = c.multi ? multi : right;

      if (c.extra) node = <INode> { ...node, ...c.extra };

      // tslint:disable-next-line:no-conditional-assignment
      if (!c.rasoc && (op = this.gbOp(ctx))) {
        bubbledNode = node;
        c = this.config[op];
      } else break;

    } while (1);

    return node;
  }

  gbOp(ctx: ParserContext): string {
    ctx.gbSp();

    const op = ctx.gtOp('binary');

    if (op in this.config) {
      ctx.gb(op.length);
      return op;
    }
    return null;
  }
}
