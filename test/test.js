const assert = require('assert');
const jsep = require('jsep');
const esprima = require('esprima');

const espression = require('../dist/bundle/espression.cjs');
const espressionJsep = new espression.BasicParser();
const espressionEsprima = new espression.ES6Parser(
  undefined,
  undefined,
  undefined,
  undefined,
  true
);

const rules = {
  string: [new espression.StringRule({ LT: true, hex: true, raw: false, escapes: true })],
};
const stringParser = new espression.Parser(rules, 'string');

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
  } else if (fail1 || fail2) {
    console.log(`Failed on: "${expr}"`);

    console.log('Parsed: ', fail1 || JSON.stringify(n1, null, 2));
    console.log('Expected: ', fail2 || JSON.stringify(n2, null, 2));
    return false;
  } else
    try {
      assert.deepEqual(n1, n2);
    } catch (e) {
      console.log(`Failed on: "${expr}"`);
      console.log('Parsed: ', JSON.stringify(n1, null, 2));
      console.log('Expected: ', JSON.stringify(n2, null, 2));
      return false;
    }

  // console.log("Passed: " + expr);
  return true;
}

function compJsep(exprs) {
  let ok = 0;
  console.log('Testing vs JSEP');
  exprs.forEach(element => compare(element, espressionJsep, jsep) && ok++);
  console.log('Passed: ' + ok + '/' + exprs.length);
  return ok === exprs.length;
}

function compEsprima(exprs) {
  let ok = 0;
  console.log('Testing vs ESPRIMA');
  exprs.forEach(
    element =>
      compare(element, espressionEsprima, expr => esprima.parse(expr, { range: false })) && ok++
  );
  console.log('Passed: ' + ok + '/' + exprs.length);
  return ok === exprs.length;
}

function compStringPos(expr, pos, result) {
  let ast;
  try {
    ast = stringParser.parse(expr);
  } catch (e) {
    console.log(`Failed on: ${expr}`);
    console.log(e.message);
    return false;
  }

  let raw = espression.toRawPosition(ast, pos);

  if (raw === result) return true;

  console.log(`Failed on: ${expr}`);
  console.log(`Wrong toRawPosition: ${raw} expected ${result} `);
}

var test1 = require('./parser/common');

// unsupported in jsep
const test2 = require('./parser/nojsep');
// octal escapes
const test3 = require('./parser/noespression');

let code = true;

compEsprima(['[,,]']);
compJsep([';a+b']);

code = code && compJsep(test1.concat(test3));
code = compEsprima(test1.concat(test2)) && code;
code = compStringPos("'123\\n\\n6789\\r\\r234'", 2, 2) && code;
code = compStringPos("'123\\n\\n6789\\r\\r234'", 6, 8) && code;
code = compStringPos("'123\\n\\n6789\\r\\r234'", 12, 16) && code;
code = compStringPos("'123\\n\\n6789\\r\\r234'", 12, 16) && code;
code = compStringPos("'123\\n\\n \\xabc \\r\\r1234'", 12, 19) && code;
code = compStringPos("'123\\n\\n \\xabc \\\n\\r1234'", 12, 19) && code;

code = process.exit(code ? 0 : 1);
