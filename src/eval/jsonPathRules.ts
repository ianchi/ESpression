/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { INode } from '../parser.interface';
import { JsonPath } from './jsonPath';
import { ES5StaticEval } from './es5';
import { StaticEval } from './eval';
import {
  JPUNION_EXP, JPEXP_EXP, JPFILTER_EXP, JPSLICE_EXP, JPWILDCARD_EXP,
  jsonPathParserFactory, es5PathParserFactory
} from '../presets/jsonPath';
import { LITERAL_EXP } from '../presets/es5conf';

export class JsonPathStaticEval extends ES5StaticEval {

  protected JPRoot(node: INode, context: object) {
    return new JsonPath(context[node.name]);
  }

  protected JPChildExpression(node: INode, context: object) {
    return this.evalMember(this._eval(node.object, context), node, false, context);
  }

  protected JPDescendantExpression(node: INode, context: object) {
    return this.evalMember(this._eval(node.object, context), node, true, context);
  }

  protected evalMember(obj: JsonPath, node: INode, descendant: boolean, context: object): JsonPath {

    const props = node.property.type === JPUNION_EXP ? node.property.expressions : [node.property];
    const childContext = Object.create(context);

    return props.reduce((acum: JsonPath, n) => {
      let ret = new JsonPath(obj);
      let member: string;
      switch (n.type) {

        case JPEXP_EXP:
          obj.forEach((val, path, _depth) => {
            if (typeof val === 'object') {
              childContext['@'] = val;
              member = this._eval(n.expression, childContext);
              if (member in val) ret.push(val[member], path.concat(member));
            }
          }, descendant ? null : 0);
          break;

        case JPFILTER_EXP:
          obj.forEach((val, path, depth) => {
            if (!depth) return; // filter applies on children
            childContext['@'] = val;
            if (this._eval(n.expression, childContext)) ret.push(val, path);
          }, descendant ? null : 1);
          break;

        case JPSLICE_EXP:
          let idx = n.expressions.map(i => i && this._eval(i, childContext));
          ret = obj.slice(idx[0], idx[1], idx[2], descendant);
          break;

        case JPWILDCARD_EXP:
          obj.forEach((val, path, depth) => {
            if (!depth) return; // applies on children
            ret.push(val, path);
          }, descendant ? null : 1);
          break;

        default:
          member = n.type === LITERAL_EXP ? n.value.toString() : n.name;

          obj.forEach((val, path, _depth) => {
            if (typeof val === 'object' && member in val) {
              ret.push(val[member], path.concat(member));
            }
          }, descendant ? null : 0);
      }
      return acum ? acum.concat(ret) : ret;
    }, null);

  }
}

export function jsonPathEvalFactory(): StaticEval {
  return new JsonPathStaticEval();
}

export function jsonPathFactory() {
  const staticEval = jsonPathEvalFactory();
  const jpParser = jsonPathParserFactory();
  const espParser = es5PathParserFactory();

  return {
    eval: (ast, ctx) => staticEval.eval(ast, ctx),
    parse: expr => espParser.parse(expr),
    evaluate: (expr, ctx) => staticEval.eval(espParser.parse(expr), ctx),

    jsonPath: (obj, expr) => staticEval.eval(jpParser.parse(expr), { $: obj })
  };
}
