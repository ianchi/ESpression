# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.8.3](https://github.com/ianchi/ESpression/compare/v1.8.2...v1.8.3) (2020-09-28)


### Bug Fixes

* **parser:** basic preset: throw missing func arg ([03bfe4f](https://github.com/ianchi/ESpression/commit/03bfe4f47112434ad2d2c914121af428a02a7bec))

### [1.8.2](https://github.com/ianchi/ESpression/compare/v1.8.1...v1.8.2) (2020-05-30)


### Bug Fixes

* error evaluating chained opt member + callExp ([c81b0a5](https://github.com/ianchi/ESpression/commit/c81b0a52b10b6cd6631076cbd7d6afde706bd64a))
* incorrect resolve mode for function calls ([297a8e3](https://github.com/ianchi/ESpression/commit/297a8e30a6acb274ab682448ba022278bb8be75c))
* missing exports after linting to single const ([35f0199](https://github.com/ianchi/ESpression/commit/35f0199d0a965693b39d7fb8fc1639bd9a594248))

### [1.8.1](https://github.com/ianchi/ESpression/compare/v1.8.0...v1.8.1) (2020-05-25)

## [1.8.0](https://github.com/ianchi/ESpression/compare/v1.7.0...v1.8.0) (2020-05-24)


### Features

* **parser:** allow code point escapes in strings ([b04aae6](https://github.com/ianchi/ESpression/commit/b04aae649d6092dda793356b71038b4f6da3ee35))


### Bug Fixes

* **eval:** arrow function default value context ([135d67e](https://github.com/ianchi/ESpression/commit/135d67e7bf038d514423d51cd2edb73d6a76ebe8))
* **eval:** error on tagged template literal ([3600499](https://github.com/ianchi/ESpression/commit/36004994dd8dab6f652203eee0d002543888b54d))
* **eval:** fix calling non shorcircuited ([19afa40](https://github.com/ianchi/ESpression/commit/19afa40bae23eb75e43019a3baf69e22f85ed9e5))
* **eval:** make es5 work with iterables ([93a24cb](https://github.com/ianchi/ESpression/commit/93a24cba95efa5665365abe9a7e1adaa41c4cf7c))
* trailing comma in function call and comma exp ([4794a2a](https://github.com/ianchi/ESpression/commit/4794a2a34c9f5de71b2b3e30993bcb435ebde7f0))
* **parser:** regexp flags being lost ([dccb452](https://github.com/ianchi/ESpression/commit/dccb452ba8f61fa01e9e7e8edea96ac7ac5e68e1))

## [1.7.0](https://github.com/ianchi/ESpression/compare/v1.6.0...v1.7.0) (2020-04-12)


### Features

* allow lvalue to be unchecked ([602fe80](https://github.com/ianchi/ESpression/commit/602fe809a916c7e8f7ec45ef0265b8da8c29f325))

## [1.6.0](https://github.com/ianchi/ESpression/compare/v1.5.0...v1.6.0) (2020-03-15)


### Features

* add destructuring assignment support ([51e667c](https://github.com/ianchi/ESpression/commit/51e667c93e54897879e7c6cd246738b9e79ef8c0))
* add destructuring in arrow func parameters ([96f195d](https://github.com/ianchi/ESpression/commit/96f195d2f54476c46d015a8a1ac6de1dfc1e1248))
* add nullish coalescing operator ([bc432bb](https://github.com/ianchi/ESpression/commit/bc432bb8fd5328b9728f614ff86597aa55e86f72))
* add object spread operator ([e54b81a](https://github.com/ianchi/ESpression/commit/e54b81a6fa6345f91ec6ba0bb0e4db85b36f5052))
* add optional chaining operators to ESnext ([3774faf](https://github.com/ianchi/ESpression/commit/3774fafa40921514ed120bf7eb3d21a37ad4b169))


### Bug Fixes

* add type information on invalid type error ([b90a92b](https://github.com/ianchi/ESpression/commit/b90a92b841e05f9d830c0da0ed7868c5809c9e08))
* array & object spread operator evaluation ([b8ab2d5](https://github.com/ianchi/ESpression/commit/b8ab2d5431e3e5460c38425069502e3a65d94502))
* function call ([793ce76](https://github.com/ianchi/ESpression/commit/793ce765ae7fa41794cf766ed6885865856b49d8))
* parseMulti check type on last element ([629429c](https://github.com/ianchi/ESpression/commit/629429c49d58a85cd327e4215a4a0269092afd88))

## [1.5.0](https://github.com/ianchi/ESpression/compare/v1.4.0...v1.5.0) (2020-03-03)


### Features

* add esnext preset with exponentiation op ([1b6413d](https://github.com/ianchi/ESpression/commit/1b6413dcbf8d7a0f60b8dc9c8cf66c0ab5dbd937))


### Bug Fixes

* location range info in string templates ([bee7140](https://github.com/ianchi/ESpression/commit/bee7140a19ad9b51f2d00c867fb8b354f211aabf))
* use right asociativity in assignment ([e09bbbc](https://github.com/ianchi/ESpression/commit/e09bbbce6433bbac89ca971037a7b3f7131fb8d6))

## [1.4.0](https://github.com/ianchi/ESpression/compare/v1.2.0...v1.4.0) (2020-01-18)


### Features

* add 'lvalue' rules in preset ([0440cf8](https://github.com/ianchi/ESpression/commit/0440cf8a8a28a3d83ddf0378c5f0e68ddfe3f05e))
* **parser:** new option to add range info in AST ([9101d0d](https://github.com/ianchi/ESpression/commit/9101d0d08b0bb67340e58a58ad3349385605b66a))


### Bug Fixes

* **parser:** linting error ([1b6a60d](https://github.com/ianchi/ESpression/commit/1b6a60d1fccc3394a3b1dfc06c94070b46f3a525))
* **parser:** position fixes and enhancements ([699258a](https://github.com/ianchi/ESpression/commit/699258af20615f6c96962c341f4dbd54ce8aad3e))

### [1.3.1](https://github.com/ianchi/ESpression/compare/v1.3.0...v1.3.1) (2019-12-20)


### Bug Fixes

* **parser:** linting error ([702424c](https://github.com/ianchi/ESpression/commit/702424c))
* **parser:** position fixes and enhancements ([3892f5f](https://github.com/ianchi/ESpression/commit/3892f5f))



## [1.3.0](https://github.com/ianchi/ESpression/compare/v1.2.0...v1.3.0) (2019-12-16)


### Features

* **parser:** new option to add range info in AST ([9101d0d](https://github.com/ianchi/ESpression/commit/9101d0d))



## [1.2.0](https://github.com/ianchi/ESpression/compare/v1.1.1...v1.2.0) (2019-07-13)


### Features

* **preset:** Add ArrowFunction parsing in new ES6 preset ([b965915](https://github.com/ianchi/ESpression/commit/b965915))
* **rules:** Add TryBranch rule ([be6a3d8](https://github.com/ianchi/ESpression/commit/be6a3d8))
* **stticEval:** Adds evaluation of ArrowFunction expressions in new ES6 preset ([1f67bb1](https://github.com/ianchi/ESpression/commit/1f67bb1))


### Tests

* add ArrowFunction tests ([f651347](https://github.com/ianchi/ESpression/commit/f651347))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/ianchi/ESpression/compare/v1.1.0...v1.1.1) (2018-08-26)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/ianchi/ESpression/compare/v1.0.3...v1.1.0) (2018-08-17)


### Bug Fixes

* solves eval of array spread and object literals ([84adb80](https://github.com/ianchi/ESpression/commit/84adb80))


### Features

* add parsing of tagged template expressions ([6193297](https://github.com/ianchi/ESpression/commit/6193297))



<a name="1.0.3"></a>
## [1.0.3](https://github.com/ianchi/ESpression/compare/v1.0.2...v1.0.3) (2018-08-16)


### Bug Fixes

* use 'evaluate' for evaluating AST ([a20e800](https://github.com/ianchi/ESpression/commit/a20e800))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/ianchi/ESpression/compare/v1.0.1...v1.0.2) (2018-08-16)


### Bug Fixes

* force missing interface typings ([303371a](https://github.com/ianchi/ESpression/commit/303371a))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/ianchi/ESpression/compare/v1.0.0...v1.0.1) (2018-08-16)



<a name="1.0.0"></a>
# [1.0.0](https://github.com/ianchi/ESpression/compare/v0.4.1...v1.0.0) (2018-08-16)


### Features

* adds more ES6 features ([2afefe5](https://github.com/ianchi/ESpression/commit/2afefe5))


### BREAKING CHANGES

* Complete reorganization of Parser codebase



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ianchi/ESpression/compare/v0.4.0...v0.4.1) (2018-07-26)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ianchi/ESpression/compare/v0.3.0...v0.4.0) (2018-07-19)


### Bug Fixes

* add missing TemplateLiteral evaluation ([6e4a7c0](https://github.com/ianchi/ESpression/commit/6e4a7c0))
* add various missing exports ([54d41e5](https://github.com/ianchi/ESpression/commit/54d41e5))
* comments error ([3802171](https://github.com/ianchi/ESpression/commit/3802171))
* correct import path ([9387809](https://github.com/ianchi/ESpression/commit/9387809))
* error in eval of '>=' ([4794bdf](https://github.com/ianchi/ESpression/commit/4794bdf))
* reactive eval of RxObject ([210d2cd](https://github.com/ianchi/ESpression/commit/210d2cd))
* reactive eval, don't throw on errors ([5152976](https://github.com/ianchi/ESpression/commit/5152976))


### Features

* add 'lvalue' evaluation function ([6e8d49c](https://github.com/ianchi/ESpression/commit/6e8d49c))
* add combineMixed rxjs operator ([a64f610](https://github.com/ianchi/ESpression/commit/a64f610))
* add RxObject, reactive object proxy wrapper ([5dc8c47](https://github.com/ianchi/ESpression/commit/5dc8c47))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ianchi/ESpression/compare/v0.2.1...v0.3.0) (2018-07-08)


### Bug Fixes

* change 'context' from property to parameter ([6bb7549](https://github.com/ianchi/ESpression/commit/6bb7549))
* conditional/logical expressions must evaluate in shortcircuit ([75e5381](https://github.com/ianchi/ESpression/commit/75e5381))


### Features

* add support for NewExpressions ([4397496](https://github.com/ianchi/ESpression/commit/4397496))
* add support for template literals ([6b9390d](https://github.com/ianchi/ESpression/commit/6b9390d))
* eval: use class inheritance for custom rules ([accd0b0](https://github.com/ianchi/ESpression/commit/accd0b0))
* **parser:** give original string when throwing ([6b6cb78](https://github.com/ianchi/ESpression/commit/6b6cb78))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ianchi/ESpression/compare/v0.2.0...v0.2.1) (2018-07-02)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ianchi/ESpression/compare/v0.1.2...v0.2.0) (2018-07-02)


### Features

* add reactive eval ([922a640](https://github.com/ianchi/ESpression/commit/922a640))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/ianchi/ESpression/compare/v0.1.1...v0.1.2) (2018-02-17)


### Bug Fixes

* allow direct import from 'espression/rules' ([ccf9408](https://github.com/ianchi/ESpression/commit/ccf9408))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ianchi/ESpression/compare/v0.1.0...v0.1.1) (2018-02-17)



<a name="0.1.0"></a>
# [0.1.0](https://github.com/ianchi/ESpression/compare/v0.0.4...v0.1.0) (2018-02-05)



<a name="0.0.4"></a>
## [0.0.4](https://github.com/ianchi/ESpression/compare/v0.0.3...v0.0.4) (2018-01-27)


### Bug Fixes

* incomplete typings ([8f79026](https://github.com/ianchi/ESpression/commit/8f79026))
