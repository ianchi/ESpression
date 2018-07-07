import { INode } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';

export type confMultipleRule = {
  type: string,
  prop: string, extra?: { [prop: string]: string }, single?: boolean,

  separator: string, implicit?: boolean, sp?: boolean, lt?: boolean,

  empty?: any, maxSep?: number
};

export class MultiOperatorRule extends BaseRule {

  constructor(public config: confMultipleRule) {
    super();
    config.extra = config.extra || {};
  }

  post(ctx: ParserContext, _preNode: INode, bubbledNode: INode): INode {
    const c = this.config;
    let nodes = [], ch, sep = 0;

    if (bubbledNode) nodes.push(bubbledNode);

    while (!ctx.eof() && (!c.maxSep || sep < c.maxSep)) {
      ctx.gbSp();
      ch = ctx.gtCh();

      if (c.separator.indexOf(ch) >= 0) {
        ctx.gbCh();
        if ('empty' in c && !bubbledNode && c.empty !== true) nodes.push(c.empty);
      } else if (!(ctx.sp && c.sp || c.lt && (ctx.lt || ctx.eof()) || bubbledNode && c.implicit)) break;
      sep++;

      bubbledNode = ctx.handleUp();
      if (bubbledNode) nodes.push(bubbledNode);
    }

    // it is not a multi operator, pass thru
    if (!sep && !(c.lt && ctx.eof())) return bubbledNode;

    if (nodes.length < sep + 1 && !('empty' in c)) ctx.err();

    const ret = {
      type: c.type,
      [c.prop]: nodes,
      ...c.extra
    };

    return nodes.length === 1 && c.single ? nodes[0] : ret;

  }

}
