/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { ICharClass, INode, IParserConfig } from './parser.interface';
import { IRuleSet, ParserContext } from './parserContext';

export class Parser {
  private config: IParserConfig;

  constructor(
    public rules: IRuleSet,
    private startBranch: string,
    identStart?: ICharClass,
    identPart?: ICharClass,
    range?: boolean
  ) {
    this.config = {
      identStart: identStart || { re: /[$_A-Za-z]/ },
      identPart: identPart || { re: /[$_0-9A-Za-z]/ },
      maxOpLen: 0,
      range: !!range,
      ops: {},
    };

    for (const label in rules)
      rules[label].forEach(rule => {
        if (typeof rule === 'string') return;
        const conf = rule.register();
        for (const op in conf) {
          if (op in this.config.ops) continue;

          this.config.ops[op] = !!conf[op].space;
          this.config.maxOpLen = Math.max(this.config.maxOpLen, op.length);
        }
      });
  }

  /**
   * Perform the parsing. It is done in two stages:
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
   *
   *
   */
  parse(expr: string): INode {
    const ctx = new ParserContext(expr, this.rules, this.config);
    const node = ctx.parseNext(this.startBranch);
    ctx.gbSp();
    if (!ctx.eof()) return ctx.err();
    return node;
  }
}
