/*
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export class ParseError extends SyntaxError {
  /** Original expression being parsed */
  expression: string;

  /** Error description */
  description: string;

  /** Position in the expression where the error was found */
  position: number;

  /** Marks that no ruled matched for the expression (or subexpression) */
  noMatch: boolean;

  constructor(message: string, expression: string, position: number, noMatch?: boolean) {
    super(`${message} ${expression[position] || ''} at position ${position}`);
    this.description = message;
    this.expression = expression;
    this.position = position;
    this.noMatch = !!noMatch;
  }
}
