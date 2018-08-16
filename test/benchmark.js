const jsep = require('jsep');
const esprima = require('esprima');

const espression = require('../')
const espressionParser_ = new espression.BasicParser();
const espressionParser = new espression.ES5Parser();

const test1 = require('./parser/common.js');
benchmark();

function benchmark() {
  let init = Date.now(),
    len;
  for (let i = 0; i < 250; i++)
    for (let str of test1) {
      try {
        jsep.parse(str);
      } catch (e) {}
    }
  len = Date.now() - init;

  console.log('JSEP: ' + 250 * test1.length + ' in ' + len + 'ms');

  init = Date.now();
  for (let i = 0; i < 250; i++)
    for (let str of test1) {
      try {
        espressionParser.parse(str);
      } catch (e) {}
    }

  len = Date.now() - init;

  console.log('ESpression: ' + 250 * test1.length + ' in ' + len + 'ms');


  init = Date.now();
  for (let i = 0; i < 250; i++)
    for (let str of test1) {
      try {
        esprima.parse(str);
      } catch (e) {}
    }
  len = Date.now() - init;

  console.log('ESPRIMA: ' + 250 * test1.length + ' in ' + len + 'ms');
}
