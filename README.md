# ESpression

*Small and customizable EcmaScript expression parser and static eval, with support for jsonPath.*



Inspired by [jsep](https://github.com/soney/jsep) Java Script Expression Parser.

## Parser

The parser aims to be fully customizable, so it is split into a basic core and then a set of rules that do the actual parsing, conforming to an API. The rules themselves try to be a generalization of a case, and so also customizable.
To have a working parser, you need to instantiate one with a configured set of rules.

ESprima comes with some presets:
* jsep 
* es5
* jsonPath


Each of these components is fully independent, so that when included with es6 imports, your final bundle can then be tree shaken, and only the used presets/rules included.

## Static Eval
A configurable static eval is included to evaluate parsed expressions.
Two presets are included:
+ es5: to use with jsep/es5 parsed output
+ jsonPath: to evaluate jsonPath expressions

## Usage

The easiest way to use ESpression is through one of the presets. 

If you only need an AST, you need to import one of the parser's presets.

Each preset expose two alternatives of use, 
+ a factory to produce an instance of a fully configured parser
+ only the array of configured rules, to do some additional tweaking and instantiate your own variation of the parser.

### ES5 AST
```
import { es5ParserFactory } from 'espression/presets';

const parser = es5ParserFactory();

let ast = parser.parse('a + b * c');
```

This preset returns Esprima compatible AST (ExpressionStatetments inside a Program Body).
All ES5 expressions are supported, except for function expressions (as it would require to parse statements in the body).


### jsep AST
```
import { jsepParserFactory } from 'espression/presets';

const parser = jsepParserFactory();

let ast = parser.parse('a + b * c');
```
Returns a jsep compatible AST (with compound statements). Keeps same limitations for expressions (i.e. no RegExp literals, no object literals)

## License

[MIT](LICENSE).
