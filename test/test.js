const assert = require('assert');
const jsep = require('jsep');
const esprima = require('esprima');

const espressionJsep = require('../dist/presets/jsep').jsepParserFactory();
const espressionEsprima = require('../dist/presets/es5').es5ParserFactory();

const evaluate = require('../dist/eval/es5').es5EvalFactory();

const jsonPath = require('../dist/eval/jsonPathRules').jsonPathEvalFactory();

function compare(expr, parser1, parser2) {
  let n1, n2, fail1, fail2;
  try {
    n1 = parser1.parse(expr);
  } catch (e) {
    fail1 = e.message;
  }

  try {
    n2 = parser2(expr);
  } catch (e) {
    fail2 = e.message;
  }

  if (fail1 && fail2) {
    console.log('Passed with both throwing on: ' + expr);
    return true;
  }
  else if (fail1 || fail2) {
    console.log("Failed on :", expr);

    console.log("Parsed: ", fail1 || JSON.stringify(n1, null, 2));
    console.log("Expected: ", fail2 || JSON.stringify(n2, null, 2));
    return false;
  }
  else
    try {
      assert.deepEqual(n1, n2);

    } catch (e) {
      console.log("Failed on :", expr);
      console.log("Parsed: ", JSON.stringify(n1, null, 2));
      console.log("Expected: ", JSON.stringify(n2, null, 2));
      return false;
    }

  console.log("Passed: " + expr);
  return true;
}




function compJsep(exprs) {
  let ok = 0;
  console.log('Testing vs JSEP')
  exprs.forEach(element => compare(element, espressionJsep, jsep) && ok++);
  console.log('Passed: ' + ok + '/' + exprs.length);
}

function compEsprima(exprs) {
  let ok = 0;
  console.log('Testing vs ESPRIMA')
  exprs.forEach(element => compare(element, espressionEsprima, esprima.parse) && ok++);
  console.log('Passed: ' + ok + '/' + exprs.length);
}


var test1 = [
  // constants
  " true",
  "false ",
  "null",
  "this",

  // strings
  "'abc'",
  '"abc"',
  "'ab\\tc'",
  "'ab\nc'",
  "'ab\rc'",
  '\\xFG',
  "\\n\\r\\t\\v\\b\\f\\\\\\'\\\"\\0",
  "\\x61",
  "'Hello\nworld'",
  "'Hello\\\nworld'",
  "'Hello\\\n\rworld'",


  // invalid strings -- should fail
  "'\\x'",
  "'\\x0'",
  "'\\xx'",
  "'\\u'",
  "'\\u0'",
  "'\\ux'",
  "'\\u00'",
  "'\\u000'",
  "'a\\u'",




  // numbers
  "0xFG",
  "0",
  "42",
  "3",
  " 1.2 ",
  " .2 ",
  "6.02214179e+23",
  "1.492417830e-10",
  "0x0",
  "0x0;",
  "0e+100 ",
  "0e+100",
  "0xabc",
  "0xdef",
  "0X1A",
  "0x10",
  "0x100",
  "0X04",
  "02",
  "08",
  "0008",
  "09",
  "09.5",
  // invalid numbers - shoud throw
  "3e",
  "3e+",
  "3e-",
  "3x",
  "3x0",
  "0x",
  "01a",
  "0o1a",
  "0o",
  "0O",
  "0o9",
  "0o18",
  "0o188",
  "0O1a",
  "0b",
  "0b1a",
  "0b9",
  "0b18",
  "0b12",
  "0B",
  "0B1a",
  "0B9",
  "0B18",
  "0B12",
  "0O9",
  "0O18",


  // identifiers
  "abc",
  "$56",
  "@235", // should throw
  "1var", // should throw
  "Δέλτα",

  // array
  "[a]",
  "[]",
  "[ ]",
  "[1, 2, 4]",
  "[ 42 ]",
  "[ 42, ]",
  "[ 1, 2, 3, ]",
  "[", // should throw
  "[,",// should throw



  // members
  "a",
  "a .b",
  "a.b. c",
  "a [b]",
  "a.b  [ c ] ",
  "$foo[ bar][ baz].other12 ['lawl'][12]",
  "a.this",

  // binary expressions
  "1+2",
  "x + y",
  "x - y",
  '"use strict" + 42',
  "x + y + z",
  "x - y + z",
  "x + y - z",
  "x - y - z",
  "x + y * z",
  "x + y / z",
  "x - y % z",
  "x * y * z",
  "x * y / z",
  "x * y % z",
  "x % y * z",
  "x << y << z",
  "x | y | z",
  "x & y & z",
  "x ^ y ^ z",
  "x & y | z",
  "x | y ^ z",
  "x | y & z",
  "'\\n' + bar",

  "x & y",
  "x ^ y",
  "x | y",
  "x || y",
  "x && y",
  "x << y",
  "x >> y",
  "x >>> y",

  "x < y",
  "x > y",
  "x <= y",
  "x >= y",
  "x in y",
  "x instanceof y",
  "x < y < z",
  "3in []", // should throw
  "0x3in[]",
  "x\\",



  "(1) + (2  ) + 3",
  "4 + 5 << (6)",




  "1*2",
  "1*(2+3)",
  "(1+2)*3",
  "(1+2)*3+4-2-5+2/2*3",
  "1 + 2-   3*	4 /8",
  "\n1\r\n+\n2\n",

  // invalid


  "(10) => 00",


  // logical expressions
  "x || y || z",
  "x && y && z",
  "x || y && z",
  "x || y ^ z",

  " a || b && c",
  "a || (b&&c)",
  "(a || b) && c",

  // unary operatos,

  "!a",
  "-b",
  "~ c",
  "+x",
  "-x",
  "void x",
  "delete x",
  "typeof x",


  // ternary

  "a ? b : c",
  " a ? b ? c : d : e",
  "a?b:c?d:e",
  "a||b ? c : d",
  "a||b&&f+5*2 ? c : d",
  "y ? 1 : 2",
  "x && y ? 1 : 2",


  // function call
  "func()",
  "func(a,b,c)",
  "func(1+2*3,c)",



  // complex

  "a || b && c | d ^ e & f == g < h >>> i + j * k",
  "a + (b < (c * d)) + e",


  "$foo     [ 12	] [ baz[z]    ].other12*4 + 1 ",
  "$foo[ bar][ baz]    (a, bb ,   c  )   .other12 ['lawl'][12]",
  "(a(b(c[!d]).e).f+'hi'==2) === true",
  "(Object.variable.toLowerCase()).length == 3",
  "(Object.variable.toLowerCase())  .  length == 3",
  "[1] + [2]",

  "obj.(prop)", // should throw
  "obj.'prop'", // should throw
  "obj.1", // should throw


  // compound
  "a b", // should throw on esprima
  "a, b",
  "a;b",
  "a\nb",
  " \n ",
  ";",
  ";a+b",
  ",,3",

];

// unsupported in jsep
const test2 = [
  "[,,]",
  "[ ,, 42 ]",
  "[ 1, 2,, 3, ]",
  "'abc'.length",
  "() + 42",
  "func(,,param)", // should throw

  "/test/",
  "/teste/i",
  "/test/i",
  "/test[/]/",
  "/test",
  "234/test",
  "234/test/ig",

  "typeof {}",
  "typeof { }",
  "typeof {prop: value}",
  "typeof {prop:value,}",
  "typeof {prop1: value1, \n 'prop2': a+b, 3:z ? x : y}",
  "typeof {prop: value,", // should fail

];

// octal escapes
const test3 = [
  "'Hello\\1World'",
  "'Hello\\02World'",
  "'Hello\\012World'",
  "'Hello\\122World'",
  "'Hello\\0122World'",
  "'Hello\\312World'",
  "'Hello\\412World'",
  "'Hello\\712World'",
  "'Hello\\0World'",
  "012",
  "0012",
  "'\\8'",
  "'\\9'",

];

const obj = {
  "firstName": "John",
  "lastName": "doe",
  "age": 26,
  "address": {
    "streetAddress": "naist street",
    "city": "Nara",
    "postalCode": "630-0192"
  },
  "phoneNumbers": [
    {
      "type": "iPhone",
      "number": "0123-4567-8888"
    },
    {
      "type": "home",
      "number": "0123-4567-8910"
    }
  ]
};

compJsep(test1.concat(test3));
compEsprima(test1.concat(test2));

jsonPath.jsonPath(obj,"$.phoneNumbers");

benchmark();

function benchmark() {
  let init = Date.now(), len;
  for (let i = 0; i < 250; i++)
    for (let str of test1) {
      try {
        jsep.parse(str);
      } catch (e) { }
    }
  len = Date.now() - init;

  console.log('JSEP: ' + 250 * test1.length + ' in ' + len + 'ms');

  init = Date.now();
  for (let i = 0; i < 250; i++)
    for (let str of test1) {
      try {
        espressionEsprima.parse(str);
      } catch (e) { }
    }

  len = Date.now() - init;

  console.log('ESpression: ' + 250 * test1.length + ' in ' + len + 'ms');


  init = Date.now();
  for (let i = 0; i < 250; i++)
    for (let str of test1) {
      try {
        esprima.parse(str);
      } catch (e) { }
    }
  len = Date.now() - init;

  console.log('ESPRIMA: ' + 250 * test1.length + ' in ' + len + 'ms');
}
