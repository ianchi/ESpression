# ESpression

*Small and customizable EcmaScript expression parser and static eval, with support for jsonPath.*

Try it live at [ESpression Tester](https://ianchi.github.io/ESpression-tester/)

Inspired by [jsep](https://github.com/soney/jsep) Java Script Expression Parser.

## Usage

ESpression can be used with different purposes:
+ as a parser to generate an AST
+ to do static evaluation of an expression's AST
+ to evaluate [jsonPath expressions](http://goessner.net/articles/JsonPath/index.html#e2), as a special case of the above
+ to do *reactive* evaluation of expressions involving observable operands. 

The easiest way to use it is through one of the presets, but it can also be completely configured to parse with custom rules. 

### ES5 expressions
```
import { es5EvalFactory, es5ParserFactory } from 'espression';

const parser = es5ParserFactory();
const staticEval = es5EvalFactory();

let ast = parser.parse('a + b * c');
let result = staticEval.eval(ast, {a:1, b:2, c:3});
```

This preset returns Esprima compatible AST (ExpressionStatetments inside a Program Body).
All ES5 expressions are supported, except for function expressions (as it would require to parse statements in the body) and new expressions.

To evaluate the ast you can provide a context object.

### jsep expressions
```
import { jsepParserFactory, es5EvalFactory } from 'espression';

const parser = jsepParserFactory();
const staticEval = es5EvalFactory();

let ast = parser.parse('a + b * c');
let result = staticEval.eval(ast, {a:1, b:2, c:3});
```
Returns a jsep compatible AST (with compound statements). Keeps same limitations for expressions (i.e. no RegExp literals, no object literals, no assignment).

The static evaluation can be performed by the same es5 preset as this ast is a subset of the other.

This preset generates a slightly smaller packages.

### jsonPath expressions

jsonPath expressions can be handled in two ways:
+ pure jsonPath expressions: `$..member`
+ mixed ES5 expressions with jsonPath: ` a + <$..member>.values[0] * 2`

#### pure jsonPath expressions

In this case only a valid jsonPath expression is allowed in the parser. 

```
import { jsonPathFactory } from 'espression';

const jp = jsonPathFactory();

let result = jp.jsonPath({a:1, b:2, c:3, d: [1,2,3]}, '$..d[:-1]');
```
The query returns a `jsonPath` object with the following properties:
+ `values`: array of matching values
+ `paths`: array of matching paths (each an array of strings with the keys)
+ `root`: the object being queried

This is shorthand for:
```
import { jsonPathParserFactory, jsonPathEvalFactory } from 'espression';

const parser = jsonPathParserFactory();
const staticEval = jsonPathEvalFactory();

let ast = parser.parse('$..d[:-1]');
let result = staticEval.eval(ast, {$: {a:1, b:2, c:3, d: [1,2,3]}});
```

#### mixed expressions

This preset introduces a new syntax to mix jsonPath inside a normal ES5 expression with a jsonPath literal notation. It is a regular jsonPath expression enclosed in `<>`, it returns a `jsonPath` object as described above.

```
import { jsonPathFactory } from 'espression';

const jp = jsonPathFactory();

let result = jp.evaluate('x + <z..d[:-1]>.values[0]', {x: 10, z: {a:1, b:2, c:3, d: [1,2,3]}});
```

This is shorthand for:
```
import { es5PathParserFactory, jsonPathEvalFactory } from 'espression';

const parser = es5PathParserFactory();
const staticEval = jsonPathEvalFactory();

let ast = parser.parse('x + <z..d[:-1]>.values[0]');
let result = staticEval.eval(ast, {x: 10, z: {a:1, b:2, c:3, d: [1,2,3]}});
```

## Parser

The parser aims to be fully customizable, so it is split into a basic core and then a set of rules that do the actual parsing, conforming to an API. The rules themselves try to be a generalization of a case, and so also customizable.
To have a working parser, you need to instantiate one with a configured set of rules.

## Static Eval
A configurable static eval is included to evaluate parsed expressions.

## Reactive Eval

Reactive expressions can be evaluated using `reactiveEvalFactory`. The evaluation returns an observable which emits the result each time any operand emits a result.

If any operand is or returns an observable, the expression will be evaluated with the values it emmits instead of the observable object itself.
Static operands are evaluated only once, when creating the resulting observable, any later changes won't be seen.
If an lvalue is required (any update/assing operation) it canno't be an observable. This operations are only statically evaluated.

```
import { es5PathParserFactory, reactiveEvalFactory } from 'espression';
import { of } from 'rxjs';


const parser = es5PathParserFactory();
const rxEval = reactiveEvalFactory();

const context = {
  a: rxjs.of(1,2,3, rxjs.asyncScheduler),
  b: 0,
  c: rxjs.of(10, 20, 30, 40,rxjs.asyncScheduler).pipe(rxop.share()) };

rxEval.eval(parser.parse('d=c*1000; a + ++b * c + d '), context)
  .subscribe(d =>
    console.log(d)
  );
```


## Bundling

Each of these components is fully independent, so that when included with es6 imports, your final bundle can then be tree shaken, and only the used presets/rules included.

## License

[MIT](LICENSE).
