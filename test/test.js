const assert = require('assert');
const jsep = require('jsep');
const acorn = require('acorn');

const espression = require('../dist/bundle/espression.cjs');
const espressionJsep = new espression.BasicParser();
const espressionNext = new espression.ESnextParser(undefined, undefined, undefined, false);
const espressionEval = new espression.ES6StaticEval();
const espressionNextLoc = new espression.ESnextParser(undefined, undefined, undefined, true);

const rules = {
  string: [new espression.StringRule({ LT: true, hex: true, raw: false, escapes: true })],
};
const stringParser = new espression.Parser(rules, 'string');

function compare(expr, parser1, parser2) {
  let n1, n2, fail1, fail2, ast;

  if (typeof expr === 'object') {
    ast = expr;
    expr = ast.expr;
    n2 = ast.ast;
    fail2 = ast.fail;
  } else {
    try {
      n2 = parser2(expr);
    } catch (e) {
      fail2 = e.message;
    }
  }

  try {
    n1 = parser1(expr);
  } catch (e) {
    fail1 = e.message;
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
  exprs.forEach(element => compare(element, e => espressionJsep.parse(e), jsep) && ok++);
  console.log('Passed: ' + ok + '/' + exprs.length);
  return ok === exprs.length;
}

function compAcorn(exprs) {
  let ok = 0;
  console.log('Testing vs Acorn');
  exprs.forEach(
    element =>
      compare(
        element,
        expr => removeKeys(espressionNext.parse(expr), ['optional', 'shortCircuited']),
        expr =>
          removeKeys(acorn.parse(expr, { locations: false, ecmaVersion: 11, ranges: false }), [
            'start',
            'end',
          ])
      ) && ok++
  );
  console.log('Passed: ' + ok + '/' + exprs.length);
  return ok === exprs.length;
}

function compAST(exprs) {
  let ok = 0;
  console.log('Testing vs AST');
  exprs.forEach(element => compare(element, expr => espressionNext.parse(expr)) && ok++);
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

function removeKeys(obj, keys) {
  var index;
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      index = keys.indexOf(prop);
      if (index > -1) delete obj[prop];
      else if (typeof obj[prop] === 'object') removeKeys(obj[prop], keys);
    }
  }

  return obj;
}

function compEval(exprs) {
  let ok = 0;
  console.log('Testing Static Evaluations');
  exprs.forEach(element => compResults(element) && ok++);
  console.log('Passed: ' + ok + '/' + exprs.length);
  return ok === exprs.length;
}

function compResults(expr) {
  let ast, fail, res;
  try {
    ast = espressionNext.parse(expr.expr);
  } catch (e) {
    console.log('Failed parsing: ', e.message);
    return false;
  }

  try {
    res = espressionEval.evaluate(ast, expr.context);
  } catch (e) {
    fail = e.message;
  }

  if (fail && expr.fail) return true;
  else if (fail || expr.fail) {
    console.log(`Failed evaluating: "${expr.expr}"`);

    console.log('Evaluated: ', fail || JSON.stringify(res, null, 2));
    console.log('Expected: ', (expr.fail && 'EvalError') || JSON.stringify(expr.result, null, 2));
    return false;
  } else
    try {
      assert.deepEqual(res, expr.result);
    } catch (e) {
      console.log(`Failed evaluating: "${expr.expr}"`);
      console.log('Evaluated: ', JSON.stringify(res, null, 2));
      console.log('Expected: ', JSON.stringify(expr.result, null, 2));
      return false;
    }

  return true;
}

var test1 = require('./parser/common');

// unsupported in jsep
const test2 = require('./parser/nojsep');
// octal escapes
const test3 = require('./parser/noespression');

const testESnext = require('./parser/esNext');

const testAST = require('./parser/ast');

const testEval = require('./staticeval/assignement_pattern');

let code = true;

code = code && compJsep([...test1, ...test3]);
code = compAcorn([...test1, ...test2, ...testESnext]) && code;
code = compAST(testAST) && code;
code = compEval(testEval) && code;
code = compStringPos("'123\\n\\n6789\\r\\r234'", 2, 2) && code;
code = compStringPos("'123\\n\\n6789\\r\\r234'", 6, 8) && code;
code = compStringPos("'123\\n\\n6789\\r\\r234'", 12, 16) && code;
code = compStringPos("'123\\n\\n6789\\r\\r234'", 12, 16) && code;
code = compStringPos("'123\\n\\n \\xabc \\r\\r1234'", 12, 19) && code;
code = compStringPos("'123\\n\\n \\xabc \\\n\\r1234'", 12, 19) && code;

code = process.exit(code ? 0 : 1);
