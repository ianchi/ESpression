/*!
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../parser.interface';

export interface ISubRuleConf {
  subRules?: string;
}
export interface IMultiConf {
  /**
   * Separator characters between expressions. Multiple separators can be given in the string.
   * Special characters:
   * + ' ' (space) match any valid space/tab character
   * + '\n' match any line terminator (LF/CR).
   * + '\0' Match two consecutive expressions with no separation
   *
   * If it is undefined the rule acts as a wrapper and matches any expression.
   * In this mode the inner AST is not an array
   */
  separators?: string;
  /**
   * If set, it limits the maximum number of operators.
   * Thus the maximum number of expressions is one more.
   * @default Infinity
   */
  maxSep?: number;
  /**
   * Allow empty expressions between **explicit** character separators.
   * If `true` empty slots are allowed and left blank
   * If an `INode` is provided, empty slots are replaced by it
   * If `false` | `undefined` error on empty slots
   */
  sparse?: boolean | INode;
  /**
   * Allow trailing separator.
   * It is redundant if `empty` is set. Otherwise it allows empty expression only at the end
   */
  trailling?: boolean;
  /** Restrict operand to only the specified AST types */
  types?: string[];
}
