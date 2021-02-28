# ESpression

_Small and customizable EcmaScript expression parser and static eval._

Try it live at [ESpression Tester](https://ianchi.github.io/ESpression-tester/)

The goal is to have a specialized expression parser with a small footprint, but full ES5+ feature set and possibility to create new syntax.

Inspired by [jsep](https://github.com/soney/jsep) Java Script Expression Parser.

## Goals

ESpression can be used with different purposes:

- as a parser to generate an AST for an expression
- to do static evaluation of an expression's AST
- to evaluate [jsonPath expressions](http://goessner.net/articles/JsonPath/index.html#e2), as a special case of the above
- to do _reactive_ evaluation of expressions involving observable operands.
- your own use case.

The easiest way to use it is through one of the presets, but it can also be completely configured to parse with custom rules.

## Usage

In most cases it can be used directly importing one of the included presets.
For advanced cases, new custom presets can be defined.

### Presets:

- **basic** (jsep compatible): `BasicParser, BasicEval`
- **ES5**: `ES5Parser, ES5StaticEval`
- **ES6**: `ES6Parser, ES6StaticEval`
- **ESnext**: `ESNextParser, ESNextStaticEval`

```
import { ESNextParser, ESNextStaticEval } from 'espression';

const parser = new ESNextParser();
const staticEval = new ESNextStaticEval();

let ast = parser.parse('a + b * c');
let result = staticEval.evaluate(ast, {a:1, b:2, c:3});
```

This preset can return Esprima compatible AST (ExpressionStatements inside a Program Body).

#### ES5 Preset

All ES5 expressions are supported, except for function expressions (as it would require to parse statements in the body).

The parser returns _ESPRIMA_ compatible AST.

```
  ES5Parser(
    noStatement?: boolean,
    identStart?: ICharClass,
    identPart?: ICharClass,
    range?: boolean
  )

  ES5StaticEval()
```

`noStatement`: if `true` returns directly the expression's AST, not wrapped in a `Program` + `ExpressionStatement` nodes

`identStart`: allows to customize the valid identifier start characters. If undefined defaults to `[$_A-Za-z]`. To be fully ES5 compliant with all unicode characters allowed, you could import and pass `es5IdentStart` object

`identPart`: allows to customize the valid identifier part characters. If undefined defaults to `[$_0-9A-Za-z]`. To be fully ES5 compliant with all unicode characters allowed, you could import and pass `es5IdentPart` object

`range`: if `true` _range_ information is included in the parsed AST, as an array with the starting and ending position in the source text

#### ES6 Preset

```
  ES6Parser(
    noStatement?: boolean,
    identStart?: ICharClass,
    identPart?: ICharClass,
    range?: boolean
  )

  ES6StaticEval()
```

In addition to ES5 it adds support for:

- template literals
- tagged template expressions
- array spread operator
- object literal: shorthand and computed properties
- arrow function expressions (only with _expression_ body)
- destructuring assignment

#### ESNext Preset

```
  ESNextParser(
    noStatement?: boolean,
    identStart?: ICharClass,
    identPart?: ICharClass,
    range?: boolean
  )

  ESNextStaticEval()
```

In addition to ES6 it adds support for:

- exponential operator ( a \*\* b)
- optional chain expressions (a?.b || o?.[m])
- nullish coalescing operator ( a ?? 10)

#### Basic Preset

Limited expressions, compatible with **JSEP** syntax. It is a bit smaller, but almost negligible.

```
BasicParser()

BasicEval()

```

This parser is not configurable

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

### API

```
parser.parse(expr: string): ASTnode
```

Parses the expression and returns the corresponding AST or throws an error.
The error object thrown has `position` property indicating the location in the string where the parsing error occurred.

## Static Eval

A configurable static eval is included to evaluate parsed expressions.

### API

```
staticEval.evaluate(node: ASTnode, context: object): any
```

Evaluates the AST of an expression and returns its result or throws an error.
The error object has a `node` property with the subexpression AST that triggered the error.
If range information was enabled in the parsers and present in the AST it can be used to identify the position of the error.

## Bundling

Each of these components is fully independent, so that when included with es6 imports, your final bundle can then be tree shaken, and only the used presets/rules included.

## License

[MIT](LICENSE).
