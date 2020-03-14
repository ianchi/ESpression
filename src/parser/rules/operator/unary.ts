/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode, IOperatorDef } from '../../parser.interface';
import { ParserContext } from '../../parserContext';
import { BaseRule } from '../baseRule';
import { IExtraConf, IMultiConf, ISubRuleConf } from '../conf.interface';

/**
 * Configuration object for a single unary expression
 */
export interface IConfUnaryOp extends ISubRuleConf, IMultiConf, IExtraConf {
  /**
   * AST node type for the unary expression
   * @remarks
   * If it is empty, then the rule decorates the AST node of the argument
   * adding the `extra`, `oper`, `prefix` properties if defined
   * `multi` and `empty` are ignored in this mode, as they could produce invalid AST
   */
  type?: string;
  /** AST property name for the group's AST. @default "argument" */
  prop?: string;
  /**
   * AST property name to store the operator string.
   * If it is empty, the operator is not stored in the AST
   */
  oper?: string;
  /**
   * AST property name to store the prefix state.
   * If it is empty, the state is not stored in the AST
   */
  prefix?: string;
  /** The operator is a prefix operator. @default false except for closed operators */
  isPre?: boolean;
  /** Operator needs a mandatory space afterwards. @example `a instanceof b` */
  space?: boolean;
  empty?: boolean;
  /** If set, the unary expression must be closed using this closing character */
  close?: string;
}
export interface IConfUnaryRule extends IOperatorDef {
  [operator: string]: IConfUnaryOp;
}

/**
 * Rule to parse most expressions with one operand
 *
 * @remarks
 * Closed operators allow for empty and multiple right operands and
 * to use different parsing rules to parse it.
 * Left operand can be restricted in its valid types
 *
 * @see [[confUnaryOp]]
 *
 * ## Syntax
 * ### General Case
 * ```
 * prefix expr (, expr2 ...) postfix
 * ```
 *
 * ### Open
 * ```
 * prefix expr
 * expr postfix
 * ```
 * @example
 * `typeof a` `++b`
 * `c++` `c--`
 *
 *
 * ### Close
 * * ```
 * prefix expr postfix
 * prefix expr1, expr2, expr3 postfix
 * ```
 * @example
 * `(expr)`
 * `[10, 20, 30]`
 *
 * ## AST
 * The resulting AST node has the format:
 * + With `type` property set
 * ```
 * {
 *   "type": conf.type,
 *   [conf.prop]: AST | AST[], // array if conf.multi
 *   [conf.oper]?: string, // if oper is not empty
 *   [conf.prefix]?: boolean, // if prefix is not empty
 *   ... conf.extra
 * }
 * ```
 * + Without `type` it returns the inner expression's AST with optional added properties
 * ```
 *  { ... <expr AST>, oper?, prefix?, ...extra? }
 * ```
 */
export class UnaryOperatorRule extends BaseRule<IConfUnaryRule> {
  preConf: IConfUnaryRule = {};
  postConf: IConfUnaryRule = {};
  constructor(public config: IConfUnaryRule) {
    super();
    let c: IConfUnaryOp;

    for (const op in config) {
      c = config[op];
      if (!c.close) {
        c.separators = c.empty = undefined;
      } else c.isPre = true;
      this.unwrapMulti(c);

      if (c.isPre) this.preConf[op] = config[op];
      else this.postConf[op] = config[op];
    }
  }

  register(): IOperatorDef {
    return this.config;
  }

  pre(ctx: ParserContext): INode | null {
    const op = ctx.gbOp(this.preConf);

    if (!op) return null;

    const c = this.preConf[op];

    const nodes = ctx.parseMulti(c, c.subRules || 0);

    if (!nodes.length && !c.empty) return ctx.err('Expression expected.');
    delete nodes.match;

    if (c.close && !ctx.tyCh(c.close)) return ctx.err('Closing character expected. Found');

    return this.makeNode(op, c.separators || !nodes.length || !nodes[0] ? nodes : nodes[0]!, ctx);
  }
  post(ctx: ParserContext, bubbledNode: INode): INode {
    const c = this.postConf;
    let op: string | null = null;

    // case of simple postfix operator
    // it doesn't allow LT between operand and operator
    if (!ctx.lt) op = ctx.gbOp(c);
    if (!op) return bubbledNode;

    if (c[op].types && c[op].types!.indexOf(bubbledNode.type) < 0)
      return ctx.err(`Invalid argument type: ${bubbledNode.type}`);

    return this.makeNode(op, bubbledNode, ctx);
  }

  makeNode(op: string, argument: INode | Array<INode | null>, ctx: ParserContext): INode {
    const c = this.config[op];
    const node: INode = !c.type
      ? <INode>argument
      : {
          type: c.type,
          [c.prop || 'argument']: argument,
        };
    if (c.oper) node[c.oper] = op;
    if (c.prefix) node[c.prefix] = !!c.isPre;

    return this.addExtra(c, node, ctx);
  }
}
