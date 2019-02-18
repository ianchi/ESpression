/*!
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser';
import { ASSIGN_PAT, IDENTIFIER_EXP, REST_ELE } from '../../parser/presets';
import { keyedObject } from '../eval';

import { ES5StaticEval } from './es5';

export class ES6StaticEval extends ES5StaticEval {
  protected ArrowFunctionExpression(node: INode, context: keyedObject): any {
    return (...params: any[]) => {
      const ctx = Object.create(context);

      for (const p of node.params) {
        switch (p.type) {
          case IDENTIFIER_EXP:
            ctx[p.name] = params.shift();
            break;
          case ASSIGN_PAT:
            const v = params.shift();
            ctx[p.left.name] = typeof v === 'undefined' ? this._eval(p.right, ctx) : v;
            break;
          case REST_ELE:
            ctx[p.argument.name] = params;
            break;
          default:
        }
      }
      return this._eval(node.body, ctx);
    };
  }
}
