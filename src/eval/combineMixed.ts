/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Observable, combineLatest, of, isObservable } from '../../../lede/luci-ng/luci2-ui-core/src/node_modules/rxjs';
import { map } from 'rxjs/operators';
/**
 * Same as `combineLatest`, but the input array can have mixed scalar and Observables.
 *
 * @param input Array of values or observables
 * @param asObservable If false and all the array is scalar, returns a scalar. Default: `true`
 */
export function combineMixed(input: any[] | object, asObservable = true): Observable<any[]> | any[] | object {

  if (Array.isArray(input)) {
    let isObs = [], pos = 0, hasObs = input.reduce(
      (acum, val, i) =>
        !!(isObs[i] = isObservable(val) && pos++) || acum, false); // tslint:disable-line:no-conditional-assignment

    if (!hasObs) return asObservable ? of(input) : input;

    return combineLatest(input.filter((_val, index) => isObs[index] !== false)).pipe(
      map(result => isObs.map((o, i) =>
        o === false ? input[i] : result[o])));
  }

  if (typeof input !== 'object') return input;

  let isObs = {}, pos = 0, observables = [];
  for (const prop in input) {
    if (isObservable(input[prop])) {
      isObs[prop] = pos++;
      observables.push(input[prop]);
    } else isObs[prop] = false;
  }

  if (!observables.length) return asObservable ? of(input) : input;

  return combineLatest(observables).pipe(map(res => {
    const result = {};
    for (const prop in isObs) {
      result[prop] = isObs[prop] === false ? input[prop] : res[isObs[prop]];
    }
    return result;
  }));

}
