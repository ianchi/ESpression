/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export interface INode {
  type: string;
  [prop: string]: any;
}

export interface ICharClass {
  re: RegExp;
  re2?: RegExp;
}

export interface IOperatorDef {
  [operator: string]: { space?: boolean };
}

export interface IParserConfig {
  identStart: ICharClass;
  identPart: ICharClass;

  maxOpLen: number;
  range?: boolean;
  ops: { [op: string]: boolean };
}
