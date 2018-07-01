import { INode } from '../parser.interface';
import { StaticEval } from './eval';
import {
  IDENTIFIER_EXP, LITERAL_EXP, MEMBER_EXP, LOGICAL_EXP, BINARY_EXP, ASSIGN_EXP, UPDATE_EXP, UNARY_EXP
} from '../presets/es5conf';
import { binaryOpCB, assignOpCB, preUpdateOpCB, postUpdateOpCB, unaryPreOpCB, unsuportedError } from './es5';
import { isObservable, of, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
export const reactiveEvalRules = {

  // Tokens
  Literal: n => n.value,

  Identifier: function (node: INode) {
    return this.context[node.name];
  },

  ThisExpression: function (node: INode) { return this.context; },

  ArrayExpression: function (node: INode) {

    return this._rxEval((...values) => values, ...node.elements);
  },

  ObjectExpression: function (node: INode) {
    const keys = [], nodes = node.properties.map(
      n => {
        let key: string;
        if (n.key.type === IDENTIFIER_EXP) key = n.key.name;
        else if (n.key.type === LITERAL_EXP) key = n.key.value.toString();
        else throw new Error('Invalid property');
        if (keys.indexOf(key) < 0) throw new Error('Duplicate property');
        keys.push(key);

        return n.value;
      });

    // add callback as first argument
    return this._rxEval((...values) => values.reduce((ret, val, i) => ret[keys[i]] = val, {}), ...nodes);
  },

  // Operators

  MemberExpression: function (node: INode): Observable<any> {

    return node.computed ?
      this._rxEval((obj, prop) => obj[prop], node.object, node.property) :
      this._rxEval((obj) => obj[node.property.name], node.object);
  },

  CallExpression: function (node: INode) {

    let params: { func, args, obj?} | Observable<{ func, args, obj?}>;

    if (node.callee.type === MEMBER_EXP) {
      params = node.computed ?
        this._rxEval((obj, prop, ...args) => ({ obj, func: obj[prop], args }), node.callee.object, node.callee.property, ...node.arguments) :
        this._rxEval((obj, ...args) => ({ obj, func: obj[node.callee.property.name], args }), node.callee.object, ...node.arguments);
    } else params = this._rxEval((func, ...args) => ({ func, args }), node.callee, ...node.arguments);

    if (!isObservable(params)) return params.func.apply(params.obj, params.args);

    return params.pipe(switchMap(
      (def) => {
        const result = def.func.apply(def.obj, def.args);

        if (isObservable(result)) return result;
        return of(result);
      }));

  },

  ConditionalExpression: function (node: INode): Observable<any> {

    return this._rxEval((t, c, a) => t ? c : a, node.test, node.consequent, node.alternate);
  },

  SequenceExpression: function (node: INode): Observable<any> {

    return this._rxEval((...values) => values.pop(), ...node.expressions);
  },

  LogicalExpression: function (node: INode): Observable<any> {
    if (!(node.operator in binaryOpCB)) throw unsuportedError(LOGICAL_EXP, node.operator);

    return this._rxEval(binaryOpCB[node.operator], node.left, node.right);
  },

  BinaryExpression: function (node: INode): Observable<any> {
    if (!(node.operator in binaryOpCB)) throw unsuportedError(BINARY_EXP, node.operator);

    return this._rxEval(binaryOpCB[node.operator], node.left, node.right);
  },

  AssignmentExpression: function (node: INode): Observable<any> {
    if (!(node.operator in assignOpCB)) throw unsuportedError(ASSIGN_EXP, node.operator);
    const left = this.lvalue(node.left);

    return assignOpCB[node.operator](left.o, left.m, this._eval(node.right));
  },

  UpdateExpression: function (node: INode): Observable<any> {
    const cb = node.prefix ? preUpdateOpCB : postUpdateOpCB;
    if (!(node.operator in cb)) throw unsuportedError(UPDATE_EXP, node.operator);
    const left = this.lvalue(node.argument);

    return cb[node.operator](left.o, left.m);
  },

  UnaryExpression: function (node: INode) {
    if (!(node.operator in unaryPreOpCB)) {
      if (node.operator === 'delete') {
        const obj = this.lvalue(node.argument);
        return delete obj.o[obj.m];
      } else throw unsuportedError(UNARY_EXP, node.operator);
    }

    return this._rxEval(unaryPreOpCB[node.operator], node.argument);
  },

  NewExpression: function (node: INode): Observable<any> {
    // tslint:disable-next-line:new-parens
    return this._rxEval((calee, ...args) => new (Function.prototype.bind.apply(calee, args)),
      node.calee, ...node.arguments);
  },

  ExpressionStatement: function (node: INode): Observable<any> {
    return this._eval(node.expression);
  },

  Program: function (node: INode): Observable<any> {

    return this._rxEval((...values) => values.pop(), ...node.body);
  },

  Compound: function (node: INode): Observable<any> {
    return this._rxEval((...values) => values.pop(), ...node.body);
  }

};

export class ReactiveEval extends StaticEval {

  constructor(rules) {
    super(rules);
  }

  _rxEval(operatorCB, ...operands: INode[]) {

    let isObs = [], hasObs = false,
      results = operands.map(
        (node, i) => {
          const res = this._eval(node);
          // tslint:disable-next-line:no-conditional-assignment
          if (isObs[i] = isObservable(res)) hasObs = true;

          return res;
        });

    if (!hasObs) return operatorCB.apply(this, results);

    return combineLatest(results.map((node, i) => isObs[i] ? node : of(node))).pipe(
      map(res => operatorCB.apply(this, res)));
  }

  lvalue(node: INode): { o, m } {
    let obj, member;

    // only static Identifiers and member expressions are allowed.
    // no observables can be an lValue
    const invalidError = new Error('Invalid left side expression');

    switch (node.type) {
      case IDENTIFIER_EXP:
        obj = this.context;
        member = node.name;
        break;
      case MEMBER_EXP:
        obj = this._eval(node.object);
        member = node.computed ? this._eval(node.property) : node.property.name;
        break;
      default:
        throw invalidError;
    }
    if (isObservable(obj) || isObservable(member) || isObservable(obj[member])) throw invalidError;

    return { o: obj, m: member };
  }

}
export function reactiveEvalFactory(): ReactiveEval {
  return new ReactiveEval(reactiveEvalRules);
}
