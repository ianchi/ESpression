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
  ch: string;
  re?: RegExp;
}
