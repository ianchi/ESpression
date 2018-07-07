/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export interface IPreResult {
  node: INode;
  final?: boolean;
  skip?: boolean;
}

export interface INode {
  type: string;
  [prop: string]: any;
}

export interface ICharClass {
  re: RegExp;
  re2?: RegExp;
}
