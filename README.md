# ESpression

_Small and customizable EcmaScript expression parser and static eval._

Try it live at [ESpression Tester](https://ianchi.github.io/ESpression-tester/)

The goal is to have a specialized expression parser with a small footprint, but full ES5+ feature set and possibility to create new syntax.

Inspired by [jsep](https://github.com/soney/jsep) Java Script Expression Parser.

## Usage

ESpression can be used with different purposes:

- as a parser to generate an AST for an expression
- to do static evaluation of an expression's AST
- to evaluate [jsonPath expressions](http://goessner.net/articles/JsonPath/index.html#e2), as a special case of the above
- to do _reactive_ evaluation of expressions involving observable operands.
- your own use case.

The easiest way to use it is through one of the presets, but it can also be completely configured to parse with custom rules.

### ES5 expressions

Presets:

- ES5
- ES6
- ESnext

```
import { ES5Eval, ES5Parser } from 'espression';

const parser = new ES5Parser();
const staticEval = new ES5Eval();

let ast = parser.parse('a + b * c');
let result = staticEval.evaluate(ast, {a:1, b:2, c:3});
```

This preset can return Esprima compatible AST (ExpressionStatements inside a Program Body), or .
All ES5 expressions are supported, except for function expressions (as it would require to parse statements in the body). Most ES6 features are also supported:

- template literals
- tagged template expressions
- array spread operator
- object literal: shorthand and computed properties
- arrow function expressions (only with _expression_ body)
- destructuring assignment

To evaluate the AST you can provide a context object whose properties are visible as variables inside the expression.

### basic expressions

Limited expressions, compatible with **JSEP** syntax. It is a bit smaller, but almost negligible.

```
import { BasicParser, BasicEval } from 'espression';

const parser = new BasicParser();
const staticEval = new BasicEval();

let ast = parser.parse('a + b * c');
let result = staticEval.evaluate(ast, {a:1, b:2, c:3});
```

Returns a jsep compatible AST (with compound statements). Keeps same limitations for expressions (i.e. no RegExp literals, no object literals, no assignment).

The static evaluation could also be performed by the same ES5Eval preset as this AST is a subset of the other.

### jsonPath expressions

jsonPath expressions can be parsed & evaluated with a preset provided by [ESpression-jsonpath](http://github.com/ianchi/espression-jsonpath) extension package.

### Reactive Eval

Reactive expressions can be evaluated using [ESpression-rx](http://github.com/ianchi/espression-rx) extension package.
The evaluation returns an observable which emits the result each time any operand emits a result.

## Parser

The parser aims to be fully customizable, so it is split into a basic core and then a set of rules that do the actual parsing, conforming to an API. The rules themselves try to be a generalization of a case, and so also customizable.
To have a working parser, you need to instantiate one with a configured set of rules.

## Static Eval

A configurable static eval is included to evaluate parsed expressions.

## Bundling

Each of these components is fully independent, so that when included with es6 imports, your final bundle can then be tree shaken, and only the used presets/rules included.

## License

[MIT](LICENSE).
