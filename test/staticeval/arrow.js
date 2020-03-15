module.exports = [
  {
    context: {},
    expr: '((a, [b,c]) => [b,c])(10,[20,30])',
    result: [20, 30],
  },
  {
    context: {},
    expr: '(({a:z, b=10}, [c]) => [z,b])({a:10},[20,30])',
    result: [10, 10],
  },
];
