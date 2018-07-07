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

/**
 * Extends ES5 StaticEval to perform reactive evaluation of expressions having Observable values.
 * It returns an Observable which emmits a new result when any dependet member emmits a new value
 */
export class ReactiveEval extends ES5StaticEval {

  /** Rule to evaluate `CallExpression` */
  protected CallExpression(node: INode) {

    const funcDef: {obj, func, args} | Observable<{obj, func, args}> = this._fcall(node);

    if (!isObservable(funcDef)) return funcDef.func.apply(funcDef.obj, funcDef.args);

    return funcDef.pipe(switchMap(
      (def) => {
        const result = def.func.apply(def.obj, def.args);

        if (isObservable(result)) return result;
        return of(result);
      }));

  }

  protected _resolve(operatorCB, ...operands: INode[]) {

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

  protected _lvalue(node: INode): { o, m } {
    const result = super._lvalue(node);
    if (isObservable(result.o) || isObservable(result.m) || isObservable(result.o[result.m])) throw new Error('Left side expression cannot be reactive.');

    return result;
  }

}
export function reactiveEvalFactory(): ReactiveEval {
  return new ReactiveEval();
}
