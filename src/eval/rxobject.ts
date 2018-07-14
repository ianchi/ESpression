/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BehaviorSubject } from 'rxjs';

export const
  AS_OBSERVABLE = Symbol('asObservable'),
  GET_OBSERVABLE = Symbol('getObservable'),
  IS_REACTIVE = Symbol('isReactive');

/** Array mutating methods that must trigger emmit */
const mutatingMethods = ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

// tslint:disable-next-line:naming-convention
export function RxObject(base: object) {
  const propSubjects: { [prop: string]: BehaviorSubject<any> } = {};
  const mainSubject = new BehaviorSubject<any>(base);

  if (typeof base !== 'object') throw new Error('Base must be an object');

  const isArray = Array.isArray(base);

  const proxy = new Proxy(base, {
    get: (target, prop) => {

      if (isArray) {

        if (typeof target[prop] === 'function') {
          if (mutatingMethods.includes(<any> prop)) {
            return function (...args) {
              const ret = target[prop](...args);
              mainSubject.next(target);
              // emmit new values for all suscribed
              // tslint:disable-next-line:forin
              for (const key in propSubjects) {
                propSubjects[key].next(target[key]);
              }
              return ret;
            };
          }
        }
      }

      if (prop === GET_OBSERVABLE) {
        return (propName) => propName in propSubjects ?
          propSubjects[propName] :
          propSubjects[propName] = new BehaviorSubject<any>(propName in target ? target[propName] : undefined);
      } else if (prop === AS_OBSERVABLE) {
        return () => mainSubject.asObservable();
      } else if (prop === IS_REACTIVE) {
        return () => true;
      }

      return target[prop];
    },

    set: (target, prop, value, _obj) => {

      target[prop] = value;
      if (propSubjects[<any> prop]) propSubjects[<any> prop].next(value);
      mainSubject.next(target);

      return true;
    }
  });

  return proxy;
}

export function isReactive(obj): boolean {
  return obj && typeof obj[IS_REACTIVE] === 'function';
}
