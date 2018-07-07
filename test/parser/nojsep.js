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
  "--1",

  // new
  "new Date",
  "new Date()",
  "new Date(Date.now())",
  "new (a+b)(c)",
  "new a.b(c)",
  "new a + b",
  "new a ? b : c",
  "new",

  // template literals

  "`string`",
  "`string ${expr}`",
  "`string ${a+b} string2`",
  "`${func(d)}`",
  "`${3,4,5}string`",
  "`string ${++expr1}${expr2} string ${expr3}`",
  "`string ${a;b;c}`", //should fail
  "`line1\nline2`",
  "`line1\\nline2`",
  "`line1\\\nline1cont`",
  "`text\\${expr}`"

];
