
import { INode } from '../parser.interface';
import { JsonPath } from './jsonPath';
import { es5EvalRules } from './es5';
import { StaticEval } from './eval';
import { jsonPathFactory, JPUNION_EXP, JPEXP_EXP, JPFILTER_EXP, JPSLICE_EXP, JPWILDCARD_EXP } from '../presets/jsonPath';
import { LITERAL_EXP } from '../presets/es5conf';

function evalMember(obj: JsonPath, node: INode, descendant: boolean): JsonPath {

  const props = node.property.type === JPUNION_EXP ? node.property.expressions : [node.property];
  const context = { ...this.context };

  return props.reduce((acum: JsonPath, n) => {
    let ret = new JsonPath(obj);
    let member: string;
    switch (n.type) {

      case JPEXP_EXP:
        obj.forEach((val, path, depth) => {
          if (typeof val === 'object') {
            context['@'] = val;
            member = this.eval(n.expression, context);
            if (member in val) ret.push(val[member], path.concat(member));
          }
        }, descendant ? null : 0);
        break;

      case JPFILTER_EXP:
        obj.forEach((val, path, depth) => {
          if (!depth) return; // filter applies on children
          context['@'] = val;
          if (this.eval(n.expression, context)) ret.push(val, path);
        }, descendant ? null : 1);
        break;

      case JPSLICE_EXP:
        let idx = n.expressions.map(i => i && this._eval(i));
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

        obj.forEach((val, path, depth) => {
          if (typeof val === 'object' && member in val) {
            ret.push(val[member], path.concat(member));
          }
        }, descendant ? null : 0);
    }
    return acum ? acum.concat(ret) : ret;
  }, null);

}
export const jsonPathEvalRules = {

  JPRoot: function (node: INode) {
    return new JsonPath(this.context[node.name]);
  },

  JPChildExpression: function (node: INode) {
    return evalMember.call(this, this._eval(node.object), node, false);
  },

  JPDescendantExpression: function (node: INode) {
    return evalMember.call(this, this._eval(node.object), node, true);
  }

};

export function jsonPathEvalFactory() {
  const staticEval = new StaticEval({ ...es5EvalRules, ...jsonPathEvalRules });
  const parser = jsonPathFactory();
  return {
    eval: (ast, ctx) => staticEval.eval(ast, ctx),
    parse: expr => parser.parse(expr),
    evaluate: (expr, ctx) => staticEval.eval(parser.parse(expr), ctx),
    jsonPath: (obj, expr) => staticEval.eval(parser.parse(expr), { $: obj })
  };
}
