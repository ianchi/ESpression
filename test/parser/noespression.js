// unsupported in ESpression

module.exports = [
  // octal escapes
  "'Hello\\1World'",
  "'Hello\\02World'",
  "'Hello\\012World'",
  "'Hello\\122World'",
  "'Hello\\0122World'",
  "'Hello\\312World'",
  "'Hello\\412World'",
  "'Hello\\712World'",
  "'Hello\\0World'",
  '012',
  '0012',
  "'\\8'",
  "'\\9'",

  // arrow function expressions non compliant cases
  '(a, b=1, ...c, ) => r',
  '(a, b=1, ...c ) \n=> r',
  '(a, b=1, ...c ) => {r:a}',
];
