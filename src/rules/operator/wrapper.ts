import { INode } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';

export type confWrapperRule = { type: string, wrap: string };
export class WrapperRule extends BaseRule {

  constructor(public config: confWrapperRule) {
    super();
  }

  post(ctx: ParserContext, preNode: INode, bubbledNode: INode): INode {
    const c = this.config;

    const node = { type: c.type };

    node[c.wrap] = bubbledNode;

    if (bubbledNode && bubbledNode.type === 'Literal' && typeof bubbledNode.value === 'string') node['directive'] = bubbledNode.raw.substring(1, bubbledNode.raw.length - 1);

    return bubbledNode ? node : null;
  }
}
