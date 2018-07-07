/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser.interface';
import { BaseRule } from '../../parser';
import { ParserContext } from '../../context';
import { LITERAL_EXP } from '../../presets/es5conf';

export type confWrapperRule = { type: string, wrap: string };
export class WrapperRule extends BaseRule {

  constructor(public config: confWrapperRule) {
    super();
  }

  post(_ctx: ParserContext, _preNode: INode, bubbledNode: INode): INode {
    const c = this.config;

    const node = { type: c.type };

    node[c.wrap] = bubbledNode;

    if (bubbledNode && bubbledNode.type === LITERAL_EXP && typeof bubbledNode.value === 'string') node['directive'] = bubbledNode.raw.substring(1, bubbledNode.raw.length - 1);

    return bubbledNode ? node : null;
  }
}
