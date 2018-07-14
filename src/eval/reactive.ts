/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../parser.interface';
import { ES5StaticEval } from './es5';
import { isObservable, of, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { isReactive, GET_OBSERVABLE, AS_OBSERVABLE } from './rxobject';

/**
 * Extends ES5 StaticEval to perform reactive evaluation of expressions having Observable values.
 * It returns an Observable which emmits a new result when any dependet member emmits a new value
 */
export class ReactiveEval extends ES5StaticEval {
  lvalue(node: INode, context: object): { o, m } {
    const result = super.lvalue(node, context);
    if (isObservable(result.o) || isObservable(result.m) || isObservable(result.o[result.m])) throw new Error('Left side expression cannot be reactive.');

    return result;
  }

  /** Rule to evaluate `MemberExpression` */
  protected MemberExpression(node: INode, context: object) {

    const obj = this._eval(node.object, context);
    const member = node.computed ? this._eval(node.property, context) : node.property.name;

    if (isReactive(obj)) {
      if (isObservable(member)) return member.pipe(switchMap(prop => obj[GET_OBSERVABLE](prop)));

      if (isReactive(obj[member])) return obj[member];

      return obj[GET_OBSERVABLE](member);
    } else if (isObservable(obj)) {

      if (isObservable<any>(member)) {
        return combineLatest([obj, member]).pipe(map(([o, m]) => o[m]));
      } else {
        return obj.pipe(map(o => o[member]));
      }
    }

    if (isObservable<any>(member)) return member.pipe(map(prop => obj[prop]));

    return obj[member];
  }

  /** Rule to evaluate `CallExpression` */
  protected CallExpression(node: INode, context: object) {

    const funcDef: { obj, func, args } | Observable<{ obj, func, args }> = this._fcall(node, context);

    if (!isObservable(funcDef)) return funcDef.func.apply(funcDef.obj, funcDef.args);

    return funcDef.pipe(switchMap(
      (def) => {
        const result = def.func.apply(def.obj, def.args);

        if (isObservable(result)) return result;
        return of(result);
      }));

  }

  protected _resolve(context: object, operatorCB, ...operands: INode[]) {

    let isObs = [], hasObs = false,
      results = operands.map(
        (node, i) => {
          const res = this._eval(node, context);
          // tslint:disable-next-line:no-conditional-assignment
          if (isObservable(res)) {
            hasObs = true;
            isObs[i] = 1;
          } else if (isReactive(res)) {
            hasObs = true;
            isObs[i] = 2;
          }

          return res;
        });

    if (!hasObs) return operatorCB(...results);

    return combineLatest(results.map((node, i) =>
      isObs[i] === 1 ? node : isObs[i] === 2 ? node[AS_OBSERVABLE]() : of(node))).pipe(
        map(res => operatorCB(...res)));
  }

}
export function reactiveEvalFactory(): ReactiveEval {
  return new ReactiveEval();
}
