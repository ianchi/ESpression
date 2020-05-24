/**
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import 'jasmine';
import * as assert from 'assert';

import jsep from 'jsep';
import { parse as acorn } from 'acorn';

import { BasicParser, ESnextParser, INode } from '../../src/main';

const jsepParser = new BasicParser();
const esnextParser = new ESnextParser(false);
export function createJSEPSpec(expr: string): void {
  let refResult: any;

  try {
    refResult = jsep(expr);

    it(`Expr: (${expr}) should be parsed`, () => {
      const node = jsepParser.parse(expr);

      expect(node).toEqual(refResult);
    });
  } catch (e) {
    it(`Expr: (${expr}) should fail`, () => {
      expect(() => jsepParser.parse(expr))
        .withContext(e.message)
        .toThrowError();
    });
  }
}

export function createAcornSpec(expr: string): void {
  let refResult: any;

  try {
    refResult = acorn(expr, { locations: false, ecmaVersion: 11, ranges: false });
    // convert to plain object to pass toEqual (which also compares constructor)
    // refResult = JSON.parse(JSON.stringify(refResult));

    // remove keys not used by ESpression
    refResult = removeKeys(refResult, ['start', 'end']);

    it(`Expr: (${expr}) should be parsed`, () => {
      let node = esnextParser.parse(expr);

      // remove keys not supported by Acorn
      node = removeKeys(node, ['optional', 'shortCircuited']);

      expect(node).toEqual(refResult);
    });
  } catch (e) {
    it(`Expr: (${expr}) should fail`, () => {
      expect(() => esnextParser.parse(expr))
        .withContext(e.message)
        .toThrowError();
    });
  }
}

export function createAstSpec(expr: { expr: string; fail?: boolean; ast?: INode }): void {
  if (expr.ast && !expr.fail)
    it(`Expr: (${expr.expr}) should be parsed`, () => {
      const node = esnextParser.parse(expr.expr);

      expect(node).toEqual(expr.ast!);
    });
  else {
    it(`Expr: (${expr.expr}) should fail`, () => {
      expect(() => esnextParser.parse(expr.expr)).toThrowError();
    });
  }
}

function removeKeys<T extends Record<string, unknown>>(obj: T, keys: string[]): T {
  let index: number;
  for (const prop in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(prop)) {
      index = keys.indexOf(prop);
      if (index > -1) delete obj[prop];
      else if (typeof obj[prop] === 'object') removeKeys((obj as any)[prop], keys);
    }
  }

  return obj;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function deepEqual(o1: any, o2: any): boolean {
  try {
    assert.deepEqual(o1, o2);
    return true;
  } catch (e) {
    return false;
  }
}
