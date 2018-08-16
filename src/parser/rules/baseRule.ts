/*
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode, IOperatorDef } from '../parser.interface';
import { ParserContext } from '../parserContext';

import { IExtraConf, IMultiConf } from './conf.interface';

/**
 * Abstract class to use as base for defining parsing rules
 */
export abstract class BaseRule<T> {
  /** Configuration of the rule */
  config = {} as T;
  unwrapMulti(config: IMultiConf): void {
    config.maxSep = !config.separators
      ? 0
      : typeof config.maxSep === 'undefined'
        ? Infinity
        : config.maxSep;
  }
  addExtra(conf: IExtraConf, node: INode): INode {
    if (!conf.extra) return node;
    if (typeof conf.extra === 'function') return conf.extra(node);
    return { ...conf.extra, ...node };
  }
  register(): IOperatorDef {
    return {};
  }
  pre(_ctx: ParserContext): INode | null {
    return null;
  }
  post(_ctx: ParserContext, bubbledNode: INode): INode {
    return bubbledNode;
  }
}
