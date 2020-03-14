// ES Next expressions
module.exports = [
  // Exponentiation

  'a**b',
  'a**b**c',
  'a**-b.c',
  'd * a**b * d + c',
  'a + b ** c * d',

  '-a ** 2', // should fail
  '(-a) ** 2', // OK
  'a ** b ** -c',

  'a ** -b',
  'a ** -b ** c', // should fail
  'a ** ( -b) ** c',
  '(a ** b).toString()',
  '(a + b).toString()',
  'a ** (a + b) ** (c/2)',
  'new Date() ** 2',
  '(new Date()) ** 2',

  'a**=2',
  'a**= b **= c',

  // object spread

  'r = {...a }',
  'r = {...a, b, ...c}',
  'r = {a, ...b, [c]:123, d:4567}',
  'r = {a, ...b+c, [c]:123, d:4567}',
  'r = {a, ...123, [c]:123, d:4567}',
  'r = {a, ...123, [c]:123, ...{a, ...b, c, d: e}}',
];
