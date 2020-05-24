/*!
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../../parser';
import { ARRAY_PAT } from '../../parser/presets';
import { keyedObject } from '../eval';

import { ES5StaticEval } from './es5';

export class ES6StaticEval extends ES5StaticEval {
  protected ArrowFunctionExpression(node: INode, context: keyedObject): any {
    return (...params: any[]): any => {
      const ctx = Object.create(context);

      this._assignPattern({ type: ARRAY_PAT, elements: node.params }, '=', params, ctx, context);

      return this._eval(node.body, ctx);
    };
  }
}
