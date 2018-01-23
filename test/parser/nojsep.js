// unsupported in jsep
module.exports = [
  "[,,]",
  "[ ,, 42 ]",
  "[ 1, 2,, 3, ]",
  "'abc'.length",
  "() + 42",
  "() <= 42",
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

  "x = 42",
  "eval = 42",
  "arguments = 42",
  "x *= 42",
  "x /= 42",
  "x %= 42",
  "x += 42",
  "x -= 42",
  "x <<= 42",
  "x >>= 42",
  "x >>>= 42",
  "x &= 42",
  "x ^= 42",
  "x |= 42",

  "3 = 4", // should fail
  "func() = 4",
  "(1 + 1) = 10",
  "i + 2 = 42",
  "+i = 42",
  'p = { "q"/ }',

  "x++",
  "x--",
  "++x",
  "--x",

  "1++", // should fail
  "1--",
  "++1",
  "--1"

];
