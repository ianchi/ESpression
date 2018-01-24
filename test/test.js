const assert = require('assert');
const jsep = require('jsep');
const esprima = require('esprima');

const espressionJsep = require('../dist/presets/jsep').jsepParserFactory();
const espressionEsprima = require('../dist/presets/es5').es5ParserFactory();

const evaluate = require('../dist/eval/es5').es5EvalFactory();

const jsonPath = require('../dist/presets/jsonPath').jsonPathParserFactory();

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
    //console.log('Passed with both throwing on: ' + expr);
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

  // console.log("Passed: " + expr);
  return true;
}




function compJsep(exprs) {
  let ok = 0;
  console.log('Testing vs JSEP')
  exprs.forEach(element => compare(element, espressionJsep, jsep) && ok++);
  console.log('Passed: ' + ok + '/' + exprs.length);
  return ok === exprs.length;
}

function compEsprima(exprs) {
  let ok = 0;
  console.log('Testing vs ESPRIMA')
  exprs.forEach(element => compare(element, espressionEsprima, esprima.parse) && ok++);
  console.log('Passed: ' + ok + '/' + exprs.length);
  return ok === exprs.length;
}

function testJsonPath(exprs) {
  let ok = 0;
  console.log('Testing jsonPath')
  exprs.forEach(element => {
    try {
      jsonPath.parse(element);
      ok++;
    } catch (e) {
      console.log("Failed on :", element);
      console.log(e.message);
    }
  });
  console.log('Passed: ' + ok + '/' + exprs.length);
  return ok === exprs.length;

}


var test1 = require('./parser/common');

// unsupported in jsep
const test2 = require('./parser/nojsep');
// octal escapes
const test3 = require('./parser/noespression');

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

testJsonPath(require('./parser/jsonPath'));

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
