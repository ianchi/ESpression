import { INode } from '../parser.interface';
import { StaticEval } from './eval';

const binaryOpCB = {
  '||': (a, b) => a || b,
  '&&': (a, b) => a && b,
  '|': (a, b) => a | b,
  '^': (a, b) => a ^ b,
  '&': (a, b) => a & b,
  '==': (a, b) => a == b, // tslint:disable-line
  '!=': (a, b) => a != b, // tslint:disable-line
  '===': (a, b) => a === b,
  '!==': (a, b) => a !== b,
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a || b,
  'instanceof': (a, b) => a instanceof b,
  'in': (a, b) => a in b,
  '<<': (a, b) => a << b,
  '>>': (a, b) => a >> b,
  '>>>': (a, b) => a >>> b,
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '%': (a, b) => a % b
};

const unaryPreOpCB = {
  '-': a => -a,
  '+': a => +a,
  '!': a => !a,
  '~': a => ~a,
  'typeof': a => typeof a,
  'void': a => void a // tslint:disable-line
};

const assignOpCB = {
  '=': (a, m, b) => a[m] = b,
  '+=': (a, m, b) => a[m] += b,
  '-=': (a, m, b) => a[m] -= b,
  '*=': (a, m, b) => a[m] *= b,
  '/=': (a, m, b) => a[m] /= b,
  '%=': (a, m, b) => a[m] %= b,
  '<<=': (a, m, b) => a[m] <<= b,
  '>>=': (a, m, b) => a[m] >>= b,
  '>>>=': (a, m, b) => a[m] >>>= b,
  '|=': (a, m, b) => a[m] |= b,
  '&=': (a, m, b) => a[m] &= b,
  '^=': (a, m, b) => a[m] ^= b
};

const preUpdateOpCB = {
  '++': (a, m) => ++a[m],
  '--': (a, m) => --a[m]
};

const postUpdateOpCB = {
  '++': (a, m) => a[m]++,
  '--': (a, m) => a[m]--
};

export const es5EvalRules = {

  // Tokens
  Literal: n => n.value,

  Identifier: function (node: INode) { return this.context[node.name]; },

  ThisExpression: function (node: INode) { return this.context; },

  ArrayExpression: function (node: INode) {
    return node.elements.map(e => this._eval(e));
  },

  ObjectExpression: function (node: INode) {
    return node.properties.reduce((res, n) => {
      let key: string;
      if (n.key.type === 'Identifier') key = n.key.name;
      else if (n.key.type === 'Literal') key = n.key.value.toString();
      else throw new Error('Invalid property');
      if (key in res) throw new Error('Duplicate property');
      res[key] = this._eval(n.value);

      return res;
    }, {});
  },

  // Operators

  MemberExpression: function (node: INode) {
    const obj = this._eval(node.object);
    return obj[node.computed ? this._eval(node.property) : node.property.name];
  },

  CallExpression: function (node: INode) {
    let callee: Function;
    let caller = undefined;

    if (node.callee.type === 'MemberExpression') {
      caller = this._eval(node.callee.object);
      callee = caller[node.callee.computed ? this._eval(node.callee.property) : node.callee.property.name];

    } else callee = this._eval(node.callee);

    return callee.apply(caller, node.arguments.map(e => this._eval(e)));
  },

  ConditionalExpression: function (node: INode) {
    return this._eval(node.test) ? this._eval(node.consequent) : this._eval(node.alternate);
  },

  SequenceExpression: function (node: INode) {
    return node.expressions.reduce((r, n) => this._eval(n), undefined);
  },

  LogicalExpression: function (node: INode) {
    if (!(node.operator in binaryOpCB)) throw new Error('Unsuported binary expression ' + node.operator);
    return binaryOpCB[node.operator](this._eval(node.left), this._eval(node.right));
  },

  BinaryExpression: function (node: INode) {
    if (!(node.operator in binaryOpCB)) throw new Error('Unsuported binary expression ' + node.operator);
    return binaryOpCB[node.operator](this._eval(node.left), this._eval(node.right));
  },
  
  AssignmentExpression: function (node: INode) {
  if (!(node.operator in assignOpCB)) throw new Error('Unsuported assignment expression ' + node.operator);
  const left = lvalue(node.left);
 
    return assignOpCB[node.operator](left.o, left.m, this._eval(node.right));
  },
  
  UpdateExpression: function (node: INode) {
    const cb = node.prefix ? preUpdateOpCB : postUpdateOpCB;
    if (!(node.operator in cb)) throw new Error('Unsuported update expression ' + node.operator);
    const left = lvalue(node.left);
 
    return cb[node.operator](left.o, left.m, this._eval(node.argument))
    

  UnaryExpression: function (node: INode) {
    if (!(node.operator in unaryPreOpCB)) {
      if(node.operator === 'delete') {
        const obj = lvalue(node.argument);
        delete obj.o[obj.m];
      } else throw new Error('Unsuported unnary expression ' + node.operator);
    }
    return unaryPreOpCB[node.operator](this._eval(node.argument));
  },
  
  NewExpression: function (node: INode) {
  
  return new (Function.prototype.bind.apply(this._eval(node.calee), node.arguments.map(e=> this._eval(e))));
  
  },

  ExpressionStatement: function (node: INode) { return this._eval(node.expression); },

  Program: function (node: INode) {
    return node.body.reduce((res, n) =>
      this._eval(n)
      , undefined);
  },
  
  Compound: function (node: INode) {
    return node.body.reduce((res, n) =>
      this._eval(n)
      , undefined);
  }

};

function lvalue(node : INode) {
let obj, member;
  switch(node.type) {
    case 'Identifier':
      obj = this.context;
      member = this.name;
      break;
    case 'MemberExpression':
      obj = this._eval(node.object);
      member = node.computed ? this._eval(node.property) : node.property.name;
      break;
    default:
      throw new Error('Invalid left side expression');
      }
      
      return {o: obj, m: member}
      }

export function es5EvalFactory(): StaticEval {
  return new StaticEval(es5EvalRules);
}
